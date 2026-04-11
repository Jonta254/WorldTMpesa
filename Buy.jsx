import { useState } from "react";
import { createOrder, updateOrder } from "../services/orderService";

export default function Buy() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [txRef, setTxRef] = useState("");

  const rate = 120;

  const placeOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    const id = await createOrder({
      type: "buy",
      amount,
      wallet,
      kes: amount * rate,
      phone: user?.phone,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    setOrderId(id);
  };

  const markPaid = async () => {
    await updateOrder(orderId, {
      status: "paid",
      txRef
    });
    alert("Payment submitted. Waiting for WLD.");
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
            placeholder="M-Pesa Code"
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
