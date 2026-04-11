import emailjs from "@emailjs/browser";

export const sendEmail = async (order) => {
  try {
    await emailjs.send(
      "service_gmailbrian",   // ✅ your service
      "template_tffz5to",     // ✅ your template
      {
        type: order.type || "unknown",
        amount: order.amount || 0,
        phone: order.phone || "N/A",
        status: order.status || "pending",
        wallet: order.wallet || "N/A",
        txRef: order.txRef || "N/A"
      },
      "4qhvP_Trh65AmpPd0"     // ✅ your public key
    );

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
};
