import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [phone, setPhone] = useState("");
  const nav = useNavigate();

  const signup = () => {
    localStorage.setItem("user", JSON.stringify({ phone }));
    nav("/");
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>
      <input className="input" onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
      <button className="btn" onClick={signup}>Create</button>
    </div>
  );
}
