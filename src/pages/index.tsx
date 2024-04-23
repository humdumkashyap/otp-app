import { useState } from "react";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [hash, setHash] = useState("");

  const sendOTP = async () => {
    const response = await fetch("/api/sendOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+91" + phone }),
    });
    const data = await response.json();
    setHash(data.hash);
  };

  const verifyOTP = async () => {
    const response = await fetch("/api/verifyOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "+91" + phone, hash: hash, otp: otp }),
    });
    const data = await response.json();
    if (data.verification) {
      alert("OTP verified successfully");
    } else {
      alert("OTP verification failed");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={"+91" + phone}
        onChange={(e) => setPhone(e.target.value.replace(/^\+91/, ""))}
        placeholder="Enter your phone number"
      />
      <button onClick={sendOTP}>Send OTP</button>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={verifyOTP}>Verify OTP</button>
    </div>
  );
}
