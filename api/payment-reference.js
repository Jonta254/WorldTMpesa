import { serializeCookie } from "./_lib/cookies.js";
import { allowMethods, sendJson } from "./_lib/http.js";
import { createServerNonce } from "./_lib/world.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  const reference = `tmpesa_${createServerNonce(18)}`;
  res.setHeader(
    "Set-Cookie",
    serializeCookie("tmpesa_payment_reference", reference, {
      maxAge: 60 * 10,
      sameSite: "None",
      secure: true,
    }),
  );

  sendJson(res, 200, { reference });
}
