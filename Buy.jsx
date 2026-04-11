import { useState } from "react";
import { createOrder, updateOrder } from "../services/orderService";
import { sendEmail } from "../services/emailService";

export default function Buy() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [txRef, setTxRef] = useState("");

  const rate = 120;

  const placeOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const order = {
      type: "buy",
      amount,
      wallet,
      kes: amount * rate,
      phone: user?.phone,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const id = await createOrder(order);
    setOrderId(id);

    // 📧 EMAIL ALERT (ORDER CREATED)
    await sendEmail(order);

    alert("Buy order placed successfully");
  };

  const markPaid = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const updatedOrder = {
      type: "buy",
      amount,
      wallet,
      phone: user?.phone,
      status: "paid",
      txRef
    };

    await updateOrder(orderId, updatedOrder);

    // 📧 EMAIL ALERT (PAYMENT SUBMITTED)
    await sendEmail(updatedOrder);

    alert("Payment submitted. Waiting for confirmation.");
  };

  return (
    <div className="container">
      <h2>🟢 Buy WLD</h2>

      {!orderId ? (
        <>
          <input
            className="input"
            placeholder="Amount"
            onChange={e => setAmount(e.target.value)}
          />

          <input
            className="input"
            placeholder="Wallet Address"
            onChange={e => setWallet(e.target.value)}
          />

          <button className="btn" onClick={placeOrder}>
            Place Order
          </button>
        </>
      ) : (
        <>
          <div className="card">
            Send KES to:
            <br />
            <b>Paybill: 123456</b>
            <br />
            Amount: {amount * rate}
          </div>

          <input
            className="input"
            placeholder="M-Pesa Transaction Code"
            onChange={e => setTxRef(e.target.value)}
          />

          <button className="btn" onClick={markPaid}>
            I HAVE PAID
          </button>
        </>
      )}
    </div>
  );
}
