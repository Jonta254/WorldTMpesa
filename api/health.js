import { allowMethods, sendJson } from "./_lib/http.js";
import { hasWorldPortalConfig } from "./_lib/world.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  sendJson(res, 200, {
    ok: true,
    worldPortalConfigured: hasWorldPortalConfig(),
  });
}
