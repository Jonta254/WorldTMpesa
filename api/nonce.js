import { serializeCookie } from "./_lib/cookies.js";
import { allowMethods, sendJson } from "./_lib/http.js";
import { createServerNonce } from "./_lib/world.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  const nonce = createServerNonce();
  res.setHeader(
    "Set-Cookie",
    serializeCookie("tmpesa_siwe", nonce, {
      maxAge: 60 * 10,
      secure: process.env.NODE_ENV === "production",
    }),
  );

  sendJson(res, 200, { nonce });
}
