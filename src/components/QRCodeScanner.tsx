"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";

type QRCodeScannerProps = {
  onScan: (text: string) => void;
};

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode
      .start(
        {
          facingMode: "environment", // caméra arrière
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop();
        },
        () => {}
      )
      .catch(console.error);

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div
      id="qr-reader"
      className="mt-4 rounded-lg overflow-hidden"
    />
  );
}