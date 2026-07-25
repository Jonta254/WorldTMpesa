import { IDKitRequestWidget, any, orbLegacy, proofOfHuman } from "@worldcoin/idkit";
import { APP_CONFIG } from "../../config/appConfig";

/**
 * Thin wrapper over IDKit's World ID 4.0 request widget, pre-wired for the
 * Tcash high-value proof-of-human action. It only ever renders once the
 * backend has minted an RP-signed context (rp_context) — IDKit requires it,
 * and the signing key never touches the client. The parent owns open state
 * and the success/failure callbacks (see useHighValueVerification).
 */
export default function HighValueVerifyWidget({
  open,
  onOpenChange,
  rpContext,
  signal,
  onVerify,
  onVerified,
  onFail,
}) {
  if (!rpContext) {
    return null;
  }

  const signalOpts = signal ? { signal } : undefined;

  return (
    <IDKitRequestWidget
      open={open}
      onOpenChange={onOpenChange}
      app_id={APP_CONFIG.worldAppId}
      action={APP_CONFIG.worldIdHighValueAction}
      rp_context={rpContext}
      // Both of World's official examples set this; without it the widget
      // demands 4.0-only proofs, which World App can refuse to even start.
      allow_legacy_proofs
      // Accept EITHER the World ID 4.0 "proof of human" credential OR a legacy
      // Orb proof. Requesting proofOfHuman() alone (a 4.0-only credential) made
      // World App fail to produce a proof for Orb-verified accounts that hold
      // only the legacy Orb credential — surfacing as World App's native
      // "Something went wrong". any(...) is a constraint tree, so it goes in
      // `constraints`, not `preset` (they're mutually exclusive in IDKit).
      // Both are proofs of a real, unique human (Orb) — the security bar for a
      // high-value order is unchanged; only the accepted credential formats
      // widen. World's /api/v4/verify endpoint remains the real authority.
      constraints={any(proofOfHuman(signalOpts), orbLegacy(signalOpts))}
      handleVerify={onVerify}
      onSuccess={onVerified}
      // IDKit's onError passes (code, debugReport) — forward both so the
      // parent can show the real code and log World's own diagnostics.
      onError={(code, debugReport) => onFail && onFail(code, debugReport)}
    />
  );
}
