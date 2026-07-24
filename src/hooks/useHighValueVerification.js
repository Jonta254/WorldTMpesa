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

// Plain-language mapping for the IDKit / World ID error codes a real user
// can actually hit at the high-value gate. Anything unmapped still shows its
// raw code in parentheses so an unexpected failure is never silent.
const WORLD_ID_ERROR_HINTS = {
  credential_unavailable:
    "This World ID isn't Orb-verified yet. High-value orders need an Orb-verified World ID — verify at an Orb, then try again.",
  max_verifications_reached:
    "You've already verified with this World ID. Reopen Tcash; if it still asks, contact support.",
  already_signed: "You've already verified with this World ID.",
  verification_rejected: "You cancelled the World ID check. You can try again.",
  invalid_network:
    "World ID network mismatch — make sure you're on the production World App, not the simulator.",
  connection_failed:
    "Couldn't reach World ID. Check your connection and try again.",
  unexpected_response:
    "World App returned an unexpected response. Please try again.",
  generic_error: "World App couldn't start World ID. Please try again.",
  failed_by_host_app: "World App couldn't start World ID. Please try again.",
};

function worldIdErrorMessage(code) {
  if (code && WORLD_ID_ERROR_HINTS[code]) {
    return WORLD_ID_ERROR_HINTS[code];
  }
  return code
    ? `World ID verification couldn't complete (${code}). You can try again.`
    : "World ID verification was not completed. You can try again.";
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

  const handleFail = useCallback((reason) => {
    pendingProceed.current = null;
    setOpen(false);
    // IDKit hands onError either a string code or an { code, detail } object.
    // Surface the real code (and a plain-language hint for the ones users
    // actually hit) instead of one generic line — the old opaque message hid
    // whether this was "not Orb-verified", "already verified", a cancel, or a
    // real config/network fault, which is exactly what's needed to diagnose a
    // prompt that won't open.
    const code =
      typeof reason === "string" ? reason : reason?.code || reason?.message || "";
    // eslint-disable-next-line no-console
    console.error("World ID verify error:", reason);
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
