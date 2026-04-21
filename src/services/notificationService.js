export async function notifyAdminOrderCreated(order) {
  try {
    const response = await fetch("/api/notify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    });

    return response.json().catch(() => ({ notified: false }));
  } catch {
    return { notified: false, error: "Notification request failed." };
  }
}
