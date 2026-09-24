import { Heart, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface SupportCardProps {
  showHeader?: boolean;
  wrapped?: boolean;
  size?: "compact" | "default";
}

function DonationCard({
  logoSrc,
  logoAlt,
  logoClassName,
  logoBoxClassName,
  children,
}: {
  logoSrc: string;
  logoAlt: string;
  logoClassName: string;
  logoBoxClassName: string;
  children: ReactNode;
}) {
  return (
    <Card variant="interactive">
      <CardContent>
        <div className="flex h-full flex-col items-center gap-3 p-4 sm:gap-4">
          <div className={logoBoxClassName}>
            <img src={logoSrc} alt={logoAlt} className={logoClassName} />
          </div>
          <div className="mt-auto flex w-full flex-col gap-2">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupportCard({
  showHeader = true,
  wrapped = true,
  size = "compact",
}: SupportCardProps) {
  const [paypalQrOpen, setPaypalQrOpen] = useState(false);
  const [venmoQrOpen, setVenmoQrOpen] = useState(false);
  const [zelleQrOpen, setZelleQrOpen] = useState(false);

  const buttonSize = size === "compact" ? "support" : "supportLg";
  const logoClassName =
    size === "compact"
      ? "h-8 object-contain sm:h-10"
      : "h-10 object-contain sm:h-12";
  const logoBoxClassName =
    size === "compact"
      ? "mb-2 flex h-14 w-full max-w-52 items-center justify-center overflow-hidden sm:h-16"
      : "mb-2 flex h-16 w-full max-w-60 items-center justify-center overflow-hidden";
  const gridGap = size === "compact" ? "gap-4" : "gap-6";
  const thankYouTextSize =
    size === "compact" ? "text-sm" : "text-base sm:text-lg";
  const zelleTextSize = size === "compact" ? "text-xs" : "text-xs sm:text-sm";

  const content = (
    <div className={wrapped ? "space-y-6" : "space-y-8"}>
      {showHeader && (
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full sm:h-16 sm:w-16">
              <Heart className="text-primary fill-primary h-6 w-6 sm:h-8 sm:w-8" />
            </div>
          </div>
          <h2 className="text-foreground text-xl font-normal tracking-tight sm:text-2xl md:text-3xl">
            Support This Project
          </h2>
          <p className="text-muted-foreground text-base font-light tracking-wide">
            Help keep Secret Santa free and ad-free for everyone
          </p>
        </div>
      )}

      <p
        className={`${thankYouTextSize} text-foreground/80 text-center leading-relaxed font-normal tracking-wide ${showHeader ? "" : "pt-8"}`}
      >
        If you find this tool helpful and would like to support its development,
        any contribution is greatly appreciated! I will personally reach out to
        thank whoever donated.
      </p>

      <div
        className={`grid md:grid-cols-3 ${gridGap} ${showHeader ? "pt-2" : "pt-8"}`}
      >
        <DonationCard
          logoSrc="/paypal-logo.png"
          logoAlt="PayPal"
          logoClassName={logoClassName}
          logoBoxClassName="mb-2 flex items-center justify-center"
        >
          <a
            href="https://www.paypal.com/donate/?business=XC32HWX8F5XGN&no_recurring=0&currency_code=USD"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button size={buttonSize}>
              Open in PayPal
              <ExternalLink data-icon="inline-end" />
            </Button>
          </a>
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => {
              setPaypalQrOpen(true);
            }}
          >
            <QrCode data-icon="inline-start" />
            Show QR Code
          </Button>
        </DonationCard>

        <DonationCard
          logoSrc="/venmo-logo.png"
          logoAlt="Venmo"
          logoClassName="h-full w-auto object-contain object-center"
          logoBoxClassName={logoBoxClassName}
        >
          <a
            href="https://venmo.com/code?user_id=2243841549664256210"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button size={buttonSize}>
              Open in Venmo
              <ExternalLink data-icon="inline-end" />
            </Button>
          </a>
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => {
              setVenmoQrOpen(true);
            }}
          >
            <QrCode data-icon="inline-start" />
            Show QR Code
          </Button>
        </DonationCard>

        <DonationCard
          logoSrc="/zelle-logo.png"
          logoAlt="Zelle"
          logoClassName="h-full w-auto object-contain object-center"
          logoBoxClassName={logoBoxClassName}
        >
          <p
            className={`${zelleTextSize} text-muted-foreground mb-auto text-center`}
          >
            Scan with your bank’s app
          </p>
          <Button
            variant="outline"
            size={buttonSize}
            onClick={() => {
              setZelleQrOpen(true);
            }}
          >
            <QrCode data-icon="inline-start" />
            Show QR Code
          </Button>
        </DonationCard>
      </div>
    </div>
  );

  const qrModals = (
    <>
      <Dialog open={paypalQrOpen} onOpenChange={setPaypalQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>PayPal QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="mx-auto flex w-full max-w-[280px] flex-col items-center gap-3 rounded-lg border bg-white p-4">
              <img
                src="/paypal.png"
                alt="PayPal QR Code"
                className="h-auto w-full object-contain"
              />
              <img
                src="/paypal-logo.png"
                alt="PayPal"
                className="h-8 object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={venmoQrOpen} onOpenChange={setVenmoQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Venmo QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="mx-auto aspect-square w-full max-w-[300px] rounded-lg border bg-white p-3">
              <img
                src="/venmo.png"
                alt="Venmo QR Code"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zelleQrOpen} onOpenChange={setZelleQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Zelle QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="mx-auto aspect-square w-full max-w-[300px] rounded-lg border bg-white p-3">
              <img
                src="/zelle.png"
                alt="Zelle QR Code"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Scan with your bank’s app
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  if (wrapped) {
    return (
      <>
        <Card variant="featured">
          <CardContent>
            <div className="space-y-6 p-6">{content}</div>
          </CardContent>
        </Card>
        {qrModals}
      </>
    );
  }

  return (
    <>
      {content}
      {qrModals}
    </>
  );
}
