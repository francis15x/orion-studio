"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

type QRCodeScannerProps = {
  onScan: (text: string) => void;
};

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const hasScanned = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (hasScanned.current) return;

          hasScanned.current = true;

          try {
            await scanner.stop();
            await scanner.clear();
          } catch {}

          setTimeout(() => {
            onScan(decodedText.trim());
          }, 500);
        },
        () => {}
      )
      .catch(console.error);

    return () => {
      scanner.stop().catch(() => {});
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="qr-reader" className="mt-4 rounded-lg overflow-hidden" />;
}