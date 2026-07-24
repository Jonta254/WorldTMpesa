import { IDKitRequestWidget, proofOfHuman } from "@worldcoin/idkit";
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

  return (
    <IDKitRequestWidget
      open={open}
      onOpenChange={onOpenChange}
      app_id={APP_CONFIG.worldAppId}
      action={APP_CONFIG.worldIdHighValueAction}
      rp_context={rpContext}
      // Both of World's official examples (mini-apps + integrate guides) pass
      // this. Without it the widget requests World-ID-4.0-only proofs, which
      // World App can fail to start for accounts/versions that produce a
      // legacy proof — surfacing as a generic "couldn't start" error.
      allow_legacy_proofs
      preset={proofOfHuman(signal ? { signal } : undefined)}
      handleVerify={onVerify}
      onSuccess={onVerified}
      // IDKit's onError passes (code, debugReport) — forward both so the
      // parent can show the real code and log World's own diagnostics.
      onError={(code, debugReport) => onFail && onFail(code, debugReport)}
    />
  );
}
