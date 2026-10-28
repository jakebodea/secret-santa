import { renderSVG } from "uqr";

interface QrCodeProps {
  value: string;
  alt: string;
  className?: string;
}

/** A printable QR code, rendered locally as an SVG image. */
export function QrCode({ value, alt, className }: QrCodeProps) {
  const svg = renderSVG(value, { border: 2, ecc: "M" });
  return (
    <img
      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
      alt={alt}
      draggable={false}
      className={className}
    />
  );
}
