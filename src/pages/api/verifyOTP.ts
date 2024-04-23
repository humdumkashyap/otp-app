import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const phone = req.body.phone;
      const hash = req.body.hash;
      const otp = req.body.otp;
      let [hashPhone, hashOtp, hashExpires] = hash.split(".");

      if (
        phone === hashPhone &&
        otp === hashOtp &&
        Date.now() <= Number(hashExpires)
      ) {
        res.status(200).json({ verification: true });
      } else {
        res.status(400).json({ verification: false });
      }
    } else {
      res.status(405).json({ message: "We only accept POST" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
