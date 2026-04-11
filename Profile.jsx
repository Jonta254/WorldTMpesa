export default function Profile() {
  return (
    <div className="container">
      <h2>👤 Profile</h2>
      <input className="input" placeholder="Phone" />
      <select className="input">
        <option>M-Pesa</option>
        <option>Airtel Money</option>
      </select>
      <button className="btn">Save</button>
    </div>
  );
}
