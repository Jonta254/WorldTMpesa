export function parseCookies(req) {
  const header = req.headers.cookie || "";

  return header.split(";").reduce((cookies, part) => {
    const [name, ...rest] = part.trim().split("=");

    if (!name) {
      return cookies;
    }

    cookies[name] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

export function serializeCookie(name, value, options = {}) {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly !== false) {
    segments.push("HttpOnly");
  }

  if (options.secure) {
    segments.push("Secure");
  }

  segments.push(`Path=${options.path || "/"}`);
  segments.push(`SameSite=${options.sameSite || "Lax"}`);

  if (typeof options.maxAge === "number") {
    segments.push(`Max-Age=${options.maxAge}`);
  }

  return segments.join("; ");
}
