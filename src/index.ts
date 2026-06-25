import socket from "baileys";
import pino from "pino";
import * as QRCode from "qrcode";
import { authState } from "./state";

const { state, saveCreds } = await authState("hedystia");

const sock = socket({
  browser: ["Hedystia MD", "Safari", "26.5"],
  auth: state,
  logger: pino({ level: "silent" }),
});

sock.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect, qr } = update;
  if (qr) {
    console.log(
      await QRCode.toString(qr, {
        type: "terminal",
        margin: 0,
        errorCorrectionLevel: "L",
        small: true,
      }),
    );
  }
});
