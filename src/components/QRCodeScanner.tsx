"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

type QRCodeScannerProps = {
  onScan: (text: string) => void;
};

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="qr-reader" className="mt-4 bg-white text-black rounded-lg p-2" />;
}