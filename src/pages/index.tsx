import { useEffect, useState } from "react";

export default function Home() {
  const [phone, setPhone] = useState<string>("+91");
  const [otp, setOtp] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [ttl, setTtl] = useState<number>(0);

  const sendOTP = async () => {
    var phoneno = new RegExp(/^\+91\d{10}$/);
    if (!phone || !phoneno.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }
    const ttl = 1 * 30 * 1000;
    setTtl(ttl);

    const response = await fetch("http://localhost:3003/api/sendOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone }),
    });
    const data = await response.json();
    setHash(data.hash);
    alert("OTP has been sent to your phone number.");
    setOtpSent(true);
  };

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} minutes and ${seconds} seconds`;
  }
  useEffect(() => {
    if (!otpSent) {
      return;
    }
    const interval = setInterval(() => {
      setTtl((prevTtl) => {
        if (prevTtl <= 0) {
          clearInterval(interval);
          setOtp("");
          alert("Timer expired. Please retry again.");
          setOtpSent(false);

          return 0;
        }
        return prevTtl - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent]);

  const verifyOTP = async (hash: String, phone: String, otp: string) => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }
    const response = await fetch("http://localhost:3003/api/verifyOTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone,
        hash: hash,
        otp: otp,
      }),
    });
    const data = await response.json();
    if (data.verification) {
      alert("OTP verified successfully");
      setPhone("+91");
      setOtp("");
      setHash("");
      setOtpSent(false);
    } else {
      alert("OTP verification failed");
      setOtp("");
      setOtpSent(false);
    }
  };

  return (
    <div className="container">
      <h1>Phone Number Verification App</h1>
      {!otpSent ? (
        <div>
          <div className="number-container">
            <label htmlFor="phone-number" className="input-label">
              Enter your mobile number
            </label>
            <input
              className="input-field"
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone("+91" + e.target.value.replace(/^\+91/, ""))
              }
              placeholder="Enter your phone number"
            />
            <button className="button" onClick={sendOTP}>
              Send OTP
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="phone-number" className="input-label">
            Enter your OTP
          </label>
          <input
            className="input-field"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />

          <p>Your OTP will expire in: {formatTime(ttl)}</p>

          <button
            className="button"
            onClick={() => verifyOTP(hash, phone, otp)}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
