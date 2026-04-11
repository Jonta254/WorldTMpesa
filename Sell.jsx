import { useState } from "react";
import { createOrder } from "../services/orderService";

export default function Sell() {
  const [amount, setAmount] = useState("");
  const rate = 120;

  const handleOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Login first");
      return;
    }

    const order = {
      type: "sell",
      amount: Number(amount),
      kes: amount * rate,
      phone: user.phone,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const id = await createOrder(order);
    alert("Order placed ✅ ID: " + id);
  };

  return (
    <div className="container">
      <h2>💸 Sell WLD</h2>

      <input
        className="input"
        placeholder="Enter amount"
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className="card">
        You receive: <b>{amount * rate || 0} KES</b>
      </div>

      <button className="btn" onClick={handleOrder}>
        Place Sell Order
      </button>
    </div>
  );
}
