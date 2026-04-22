import { serializeCookie } from "./_lib/cookies.js";
import { allowMethods, sendJson } from "./_lib/http.js";
import { createSignedServerNonce } from "./_lib/world.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  const { nonce, nonceSignature } = createSignedServerNonce();
  res.setHeader(
    "Set-Cookie",
    serializeCookie("tmpesa_siwe", nonce, {
      maxAge: 60 * 10,
      sameSite: "None",
      secure: true,
    }),
  );

  sendJson(res, 200, { nonce, nonceSignature });
}
