export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) {
    return true;
  }

  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { error: `Method ${req.method} not allowed.` });
  return false;
}
