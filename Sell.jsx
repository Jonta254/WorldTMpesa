import { useState } from "react";
import { createOrder, updateOrder } from "../services/orderService";
import { sendEmail } from "../services/emailService";

export default function Sell() {
  const [amount, setAmount] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [txRef, setTxRef] = useState("");

  const rate = 120;

  const placeOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const order = {
      type: "sell",
      amount,
      kes: amount * rate,
      phone: user?.phone,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const id = await createOrder(order);
    setOrderId(id);

    // 📧 EMAIL ALERT (ORDER CREATED)
    await sendEmail(order);

    alert("Order placed successfully");
  };

  const markSent = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const updatedOrder = {
      type: "sell",
      amount,
      phone: user?.phone,
      status: "paid",
      txRef
    };

    await updateOrder(orderId, updatedOrder);

    // 📧 EMAIL ALERT (USER SENT FUNDS)
    await sendEmail(updatedOrder);

    alert("Marked as sent. Waiting for admin confirmation.");
  };

  return (
    <div className="container">
      <h2>💸 Sell WLD</h2>

      {!orderId ? (
        <>
          <input
            className="input"
            placeholder="Amount"
            onChange={e => setAmount(e.target.value)}
          />

          <p>You get: {amount * rate || 0} KES</p>

          <button className="btn" onClick={placeOrder}>
            Place Order
          </button>
        </>
      ) : (
        <>
          <div className="card">
            Send WLD to:
            <br />
            <b>YOUR WALLET ADDRESS</b>
          </div>

          <input
            className="input"
            placeholder="Transaction Hash"
            onChange={e => setTxRef(e.target.value)}
          />

          <button className="btn" onClick={markSent}>
            SENT
          </button>
        </>
      )}
    </div>
  );
}
