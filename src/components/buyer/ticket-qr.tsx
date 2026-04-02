"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

type TicketQrProps = {
  payload: string;
  size?: number;
  className?: string;
};

export function TicketQr({ payload, size = 220, className = "" }: TicketQrProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((value: string) => {
        if (!active) return;
        setSrc(value);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setSrc(null);
        setError("Impossible de générer le QR.");
      });

    return () => {
      active = false;
    };
  }, [payload, size]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-3xl border border-red-200 bg-red-50 text-center text-sm text-red-700 ${className}`}
        style={{ width: size, height: size }}
      >
        {error}
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-500 ${className}`}
        style={{ width: size, height: size }}
      >
        Génération du QR...
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 ${className}`}>
      <Image
        src={src}
        alt="QR code du billet"
        width={size}
        height={size}
        unoptimized
        className="h-auto w-full"
      />
    </div>
  );
}
