import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

interface Env {
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
}

const env: Env = {
  TWILIO_ACCOUNT_SID: "ACf8c6887b4c592027c7fed8e1a7dbdf9a",
  TWILIO_AUTH_TOKEN: "2b3468a087207475c79f995af6f3839c",
  TWILIO_PHONE_NUMBER: "+13025660545",
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

app.post("/api/sendOTP", async (req: Request, res: Response) => {
  const phone: string = req.body.phone;
  const otp: number = Math.floor(100000 + Math.random() * 900000);
  const ttl: number = 2 * 60 * 1000; // 2 Minutes in MilliSeconds
  const expires: number = Date.now() + ttl;
  const data: string = `${phone}.${otp}.${expires}`;

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

app.post("/api/verifyOTP", (req: Request, res: Response) => {
  const phone: string = req.body.phone;
  const hash: string = req.body.hash;
  const otp: string = req.body.otp;
  let [hashPhone, hashOtp, hashExpires] = hash.split(".");

  if (
    phone == hashPhone &&
    otp == hashOtp &&
    Date.now() <= Number(hashExpires)
  ) {
    res.status(200).json({ verification: true });
  } else {
    res.status(400).json({ verification: false });
  }
});

app.listen(3003, () => {
  console.log("Server started on port 3003");
});
