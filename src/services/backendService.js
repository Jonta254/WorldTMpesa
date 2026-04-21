async function readJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Backend request failed.");
  }

  return payload;
}

export async function requestServerNonce() {
  const response = await fetch("/api/nonce", {
    credentials: "include",
  });

  return readJsonResponse(response);
}

export async function completeSiweVerification(payload, nonce) {
  const response = await fetch("/api/complete-siwe", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload, nonce }),
  });

  return readJsonResponse(response);
}

export async function createPaymentReference() {
  const response = await fetch("/api/payment-reference", {
    method: "POST",
    credentials: "include",
  });

  return readJsonResponse(response);
}

export async function confirmWorldPayment(payload) {
  const response = await fetch("/api/confirm-payment", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readJsonResponse(response);
}
