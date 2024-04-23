import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/sendOTP", (req, res) => {
  const phone = req.body.phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const ttl = 2 * 60 * 1000; // 2 Minutes in MilliSeconds
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;

  client.messages
    .create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    .then((message) => console.log(message.sid));

  res.send({
    phone: phone,
    hash: data,
    expires: expires,
  });
});

app.post("/verifyOTP", (req, res) => {
  const phone = req.body.phone;
  const hash = req.body.hash;
  const otp = req.body.otp;
  let [hashPhone, hashOtp, hashExpires] = hash.split(".");

  if (phone === hashPhone && otp === hashOtp && Date.now() <= hashExpires) {
    res.send({ verification: true });
  } else {
    res.send({ verification: false });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
