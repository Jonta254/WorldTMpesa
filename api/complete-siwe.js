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

    if (payload?.status !== "success" || !payload?.signature || !payload?.message) {
      sendJson(res, 400, {
        isValid: false,
        error: "World wallet authentication was not completed.",
      });
      return;
    }

    if (!nonce || nonce !== cookies.tmpesa_siwe) {
      sendJson(res, 400, {
        isValid: false,
        error: "Invalid nonce.",
      });
      return;
    }

    const verification = await verifySiweMessage(payload, nonce);
    const verifiedAddress = verification.siweMessageData?.address || payload.address;

    res.setHeader(
      "Set-Cookie",
      serializeCookie("tmpesa_siwe", "", {
        maxAge: 0,
        secure: process.env.NODE_ENV === "production",
      }),
    );

    sendJson(res, 200, {
      isValid: Boolean(verification.isValid && verifiedAddress),
      address: verifiedAddress,
      nonce,
    });
  } catch (error) {
    sendJson(res, 400, {
      isValid: false,
      error: error instanceof Error ? error.message : "Unable to verify wallet auth.",
    });
  }
}
