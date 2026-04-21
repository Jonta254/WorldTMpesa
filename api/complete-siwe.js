import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import { parseCookies, serializeCookie } from "./_lib/cookies.js";
import { allowMethods, readJsonBody, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const { payload, nonce } = await readJsonBody(req);
    const cookies = parseCookies(req);

    if (!nonce || nonce !== cookies.tmpesa_siwe) {
      sendJson(res, 400, {
        isValid: false,
        error: "Invalid nonce.",
      });
      return;
    }

    const verification = await verifySiweMessage(payload, nonce);
    res.setHeader(
      "Set-Cookie",
      serializeCookie("tmpesa_siwe", "", {
        maxAge: 0,
        secure: process.env.NODE_ENV === "production",
      }),
    );

    sendJson(res, 200, {
      isValid: verification.isValid,
      address: verification.siweMessageData.address,
      nonce,
    });
  } catch (error) {
    sendJson(res, 400, {
      isValid: false,
      error: error instanceof Error ? error.message : "Unable to verify wallet auth.",
    });
  }
}
