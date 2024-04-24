import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("req.method", req.method);
  if (req.method === "POST") {
    const phone = req.body.phone;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 2 * 60 * 1000; // 2 Minutes in MilliSeconds
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;

    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.status(200).json({
      phone: phone,
      hash: data,
      expires: expires,
    });
  } else {
    res.status(405).json({ message: "We only accept POST" });
  }
}
