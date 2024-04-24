import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const env = {
  TWILIO_ACCOUNT_SID: "ACf8c6887b4c592027c7fed8e1a7dbdf9a",
  TWILIO_AUTH_TOKEN: "2b3468a087207475c79f995af6f3839c",
  TWILIO_PHONE_NUMBER: "+13025660545",
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

app.post("/api/sendOTP", (req, res) => {
  const phone = req.body.phone;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const ttl = 2 * 60 * 1000; // 2 Minutes in MilliSeconds
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;

  console.log("sendOTP", req.body);
  client.messages
    .create({
      body: `Your OTP is ${otp}`,
      from: env.TWILIO_PHONE_NUMBER,
      to: "(302) 566-0545",
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

app.listen(3001, () => {
  console.log("Server started on port 3001");
});
