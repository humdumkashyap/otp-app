import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const env = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

app.post("/api/sendOTP", async (req, res) => {
  const phone = req.body.phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const ttl = 1 * 30 * 1000;  
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;

  var phoneno = new RegExp(/^\+91\d{10}$/);
  if (!phoneno.test(phone)) {
    res.status(500).json({
      message: "Invalid Phone Number",
    });
    return;
  }

  try {
    const response = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.status(200).json({
      phone: phone,
      hash: data,
      expires: expires,
      sid: response.sid,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error in sending OTP",
      error: err,
    });
  }
});

app.post("/api/verifyOTP", (req, res) => {
  const phone = req.body.phone;
  const hash = req.body.hash;
  const otp = req.body.otp;
  let [hashPhone, hashOtp, hashExpires] = hash.split(".");

  if (phone == hashPhone && otp == hashOtp && Date.now() <= hashExpires) {
    res.status(200).json({ verification: true });
  } else {
    res.status(400).json({ verification: false });
  }
});

app.listen(3003, () => {
  console.log("Server started on port 3003");
});
