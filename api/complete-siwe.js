import { parseCookies, serializeCookie } from "./_lib/cookies.js";
import { allowMethods, readJsonBody, sendJson } from "./_lib/http.js";
import { isValidSignedServerNonce } from "./_lib/world.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const { payload, nonce, nonceSignature } = await readJsonBody(req);
    const cookies = parseCookies(req);

    if (payload?.status !== "success" || !payload?.signature || !payload?.message) {
      sendJson(res, 400, {
        isValid: false,
        error: "World wallet authentication was not completed.",
      });
      return;
    }

    const cookieMatches = nonce && nonce === cookies.tmpesa_siwe;
    const signedNonceMatches = isValidSignedServerNonce(nonce, nonceSignature);

    if (!cookieMatches && !signedNonceMatches) {
      sendJson(res, 400, {
        isValid: false,
        error: "World wallet session expired. Please try again.",
      });
      return;
    }

    const { verifySiweMessage } = await import("@worldcoin/minikit-js");
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
