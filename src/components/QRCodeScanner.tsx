"use client";

import { Scanner } from "@yudiel/react-qr-scanner";

type QRCodeScannerProps = {
  onScan: (text: string) => void;
};

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  return (
    <div className="mt-4 rounded-lg overflow-hidden bg-black">
      <Scanner
        constraints={{ facingMode: "environment" }}
        onScan={(result) => {
          const value = result?.[0]?.rawValue;
          if (value) {
            onScan(value.trim());
          }
        }}
        onError={(error) => {
          console.log(error);
        }}
      />
    </div>
  );
}