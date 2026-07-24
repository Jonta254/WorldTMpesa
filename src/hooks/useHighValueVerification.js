import { Suspense, createElement, lazy, useCallback, useEffect, useRef, useState } from "react";
import { APP_CONFIG } from "../config/appConfig";
import {
  fetchWorldIdStatus,
  requestWorldIdSignedContext,
  submitWorldIdProof,
} from "../services/backendService";

// Lazy so @worldcoin/idkit (and its ~870KB proof WASM) is a separate chunk
// that only downloads when a user actually hits the high-value gate — the
// common, sub-threshold order never pays for it.
const HighValueVerifyWidget = lazy(
  () => import("../components/worldid/HighValueVerifyWidget"),
);

// Plain-language mapping for World's documented IDKit error codes
// (docs.world.org/world-id/idkit/error-codes). The raw code is always
// appended in parentheses so a failure is never ambiguous while this gate is
// still being hardened on real devices.
const WORLD_ID_ERROR_HINTS = {
  // user actions — neutral
  user_rejected: "You cancelled the World ID check.",
  verification_rejected: "You cancelled the World ID check.",
  cancelled: "The World ID check was cancelled.",
  user_presence_failed: "The World ID check wasn't completed — try again.",
  // credential / eligibility
  credential_unavailable:
    "This World ID can't provide the required proof yet (an Orb proof of human). Verify at an Orb, then try again.",
  world_id_4_not_available:
    "This World App account can't do World ID 4.0 yet. Update World App, or verify at an Orb.",
  world_id_3_not_available: "This World App account can't complete this check.",
  identity_attributes_not_matched:
    "Your World ID didn't match what this order requires.",
  max_verifications_reached:
    "You've already verified with this World ID — reopen Tcash; if it still asks, contact support.",
  nullifier_replayed:
    "You've already verified with this World ID. Reopen Tcash to continue.",
  // request / RP config (developer-side)
  malformed_request: "Tcash sent an invalid verification request. Please contact support.",
  invalid_rp_signature: "Tcash's verification request was rejected. Please try again.",
  rp_signature_expired: "The verification request expired. Please try again.",
  timestamp_too_old: "The verification request expired. Please try again.",
  duplicate_nonce: "Please try the World ID check again.",
  unknown_rp: "Tcash isn't fully set up for World ID yet. Please contact support.",
  inactive_rp: "Tcash's World ID setup is inactive. Please contact support.",
  // environment / transport
  invalid_network:
    "World ID environment mismatch — make sure you're on the production World App.",
  connection_failed: "Couldn't reach World ID. Check your connection and try again.",
  timeout: "World ID timed out. Please try again.",
  inclusion_proof_pending: "Your World ID isn't ready yet — wait a moment and try again.",
  inclusion_proof_failed: "World ID couldn't build your proof. Please try again.",
  unexpected_response: "World App returned an unexpected response. Please try again.",
  // proof succeeded but our backend callback failed
  failed_by_host_app:
    "Your proof was accepted, but Tcash couldn't record it. Please try again.",
  generic_error: "World App couldn't complete World ID. Please try again.",
};

function worldIdErrorMessage(code) {
  const hint =
    (code && WORLD_ID_ERROR_HINTS[code]) || "World ID verification didn't complete.";
  return code ? `${hint} (${code})` : `${hint} You can try again.`;
}

/**
 * Gates high-value order creation behind a one-time World ID proof-of-human.
 *
 * A page calls `ensureVerified(kesAmount, proceed)` right before it would
 * create the order. If the amount is below the threshold, verification is
 * off in this environment, or the wallet already verified once, `proceed`
 * runs immediately. Otherwise the World ID widget opens; `proceed` runs only
 * after the proof is accepted server-side. The real enforcement is in
 * api/orders.js — this is purely the pre-payment UX so a user isn't asked to
 * verify only *after* they've already moved money.
 *
 * Render the returned `widget` element somewhere in the page for the modal
 * to mount.
 */
export function useHighValueVerification({ wallet } = {}) {
  const [available, setAvailable] = useState(false);
  const [verified, setVerified] = useState(false);
  const [threshold, setThreshold] = useState(
    APP_CONFIG.tradeLimits.highValueKesThreshold,
  );
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const pendingProceed = useRef(null);

  useEffect(() => {
    let active = true;

    fetchWorldIdStatus()
      .then((status) => {
        if (!active || !status) {
          return;
        }
        setAvailable(Boolean(status.available));
        setVerified(Boolean(status.verified));
        if (Number(status.threshold) > 0) {
          setThreshold(Number(status.threshold));
        }
      })
      .catch(() => {
        // Status is only a UX hint; the server-side gate stands regardless.
        // Treat an unreachable status as "feature off" so we never block the
        // existing flow on a transient status failure.
      });

    return () => {
      active = false;
    };
  }, []);

  const needsVerification = useCallback(
    (kesAmount) => available && !verified && Number(kesAmount) >= threshold,
    [available, verified, threshold],
  );

  const ensureVerified = useCallback(
    async (kesAmount, proceed) => {
      if (!needsVerification(kesAmount)) {
        await proceed();
        return;
      }

      pendingProceed.current = proceed;
      setError("");
      setStarting(true);

      try {
        const { rp_context } = await requestWorldIdSignedContext();
        setRpContext(rp_context);
        setOpen(true);
      } catch (nextError) {
        pendingProceed.current = null;
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Tcash could not start World ID verification.",
        );
      } finally {
        setStarting(false);
      }
    },
    [needsVerification],
  );

  const handleVerify = useCallback(async (result) => {
    // Throwing here tells IDKit the proof was rejected (surfaces onError),
    // so the server's verdict — not just World's — decides success.
    await submitWorldIdProof(result);
  }, []);

  const handleVerified = useCallback(async () => {
    setVerified(true);
    setOpen(false);
    const proceed = pendingProceed.current;
    pendingProceed.current = null;
    if (proceed) {
      await proceed();
    }
  }, []);

  const handleFail = useCallback((reason, debugReport) => {
    pendingProceed.current = null;
    setOpen(false);
    // IDKit's onError passes (code, debugReport); code may be a string or an
    // { code } object. Surface the real code (always shown in the message) and
    // log World's debugReport so a "couldn't start" failure is diagnosable
    // without guessing.
    const code =
      typeof reason === "string" ? reason : reason?.code || reason?.message || "";
    // eslint-disable-next-line no-console
    console.error("World ID verify error:", code, reason, debugReport);
    setError(worldIdErrorMessage(code));
  }, []);

  // Only mount (and therefore download) the widget once verification has
  // actually started — before that there is nothing to show.
  const widget =
    open || rpContext
      ? createElement(
          Suspense,
          { fallback: null },
          createElement(HighValueVerifyWidget, {
            open,
            onOpenChange: setOpen,
            rpContext,
            signal: wallet || undefined,
            onVerify: handleVerify,
            onVerified: handleVerified,
            onFail: handleFail,
          }),
        )
      : null;

  return {
    available,
    verified,
    threshold,
    needsVerification,
    ensureVerified,
    starting,
    error,
    widget,
  };
}
