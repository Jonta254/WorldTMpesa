import { allowMethods, readJsonBody, sendJson } from "./_lib/http.js";
import { getWorldPortalConfig } from "./_lib/world.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const { payload, action, signal } = await readJsonBody(req);

    if (payload?.status !== "success" || !action) {
      sendJson(res, 400, {
        success: false,
        error: "Missing verification payload or action identifier.",
      });
      return;
    }

    const { appId } = getWorldPortalConfig();
    const { verifyCloudProof } = await import("@worldcoin/minikit-js");
    const verifyRes = await verifyCloudProof(payload, appId, action, signal);

    if (!verifyRes?.success) {
      sendJson(res, 400, {
        success: false,
        error: verifyRes?.detail || verifyRes?.code || "Verification was not accepted.",
        verifyRes,
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      verifyRes,
    });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : "Unable to verify proof.",
    });
  }
}
