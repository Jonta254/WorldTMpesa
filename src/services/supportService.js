import { getSettings } from "./settingsService";

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

function buildMailToUrl({ subject, body }) {
  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${encodeURIComponent(getSettings().supportEmail)}?${params.toString()}`;
}

export function openSupportEmail({ subject, body }) {
  const mailToUrl = buildMailToUrl({ subject, body });
  const gmailUrl = buildGmailComposeUrl({ subject, body });

  const link = document.createElement("a");
  link.href = mailToUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.location.href = gmailUrl;
  }, 700);
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
