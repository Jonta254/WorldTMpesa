import { getSettings } from "./settingsService";

const WORLD_REPORT_URL = "https://world.org";

function buildGmailComposeUrl({ subject, body }) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: getSettings().supportEmail,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function openSupportEmail({ subject, body }) {
  const gmailUrl = buildGmailComposeUrl({ subject, body });
  window.location.assign(gmailUrl);
}

export function openWorldReportPage() {
  window.open(WORLD_REPORT_URL, "_blank", "noopener,noreferrer");
}

export function openOrderSupportEmail(order, mode = "support") {
  const subject =
    mode === "delay"
      ? `TMpesa payment delay help - Order ${order.id}`
      : `TMpesa support request - Order ${order.id}`;

  const body = [
    `Hello TMpesa team,`,
    "",
    mode === "delay"
      ? "I need help because my order appears delayed."
      : "I need support with my order.",
    "",
    `Order ID: ${order.id}`,
    `Order Type: ${order.type}`,
    `Asset: ${order.asset}`,
    `Crypto Amount: ${order.cryptoAmount}`,
    `KES Amount: ${order.kesAmount}`,
    `Status: ${order.status}`,
    order.paymentReference ? `Reference: ${order.paymentReference}` : null,
    "",
    "Please assist me.",
  ]
    .filter(Boolean)
    .join("\n");

  openSupportEmail({ subject, body });
}
