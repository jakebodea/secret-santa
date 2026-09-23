import { Heart, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface SupportCardProps {
  /** Whether to show the card's internal header. Defaults to true. */
  showHeader?: boolean;
  /** Whether to wrap the content in a Card component. Defaults to true. */
  wrapped?: boolean;
  /** Size variant for the donation cards. 'compact' for smaller (card), 'default' for larger (page). */
  size?: "compact" | "default";
}

export function SupportCard({
  showHeader = true,
  wrapped = true,
  size = "compact",
}: SupportCardProps) {
  const [paypalQrOpen, setPaypalQrOpen] = useState(false);
  const [venmoQrOpen, setVenmoQrOpen] = useState(false);
  const [zelleQrOpen, setZelleQrOpen] = useState(false);

  const buttonHeight = size === "compact" ? "h-10 sm:h-11" : "h-11 sm:h-12";
  const buttonTextSize = size === "compact" ? "text-sm" : "text-base";
  const logoHeight = size === "compact" ? "h-8 sm:h-10" : "h-10 sm:h-12";
  const logoContainerHeight = size === "compact" ? "3.5rem" : "4rem";
  const logoMaxWidth = size === "compact" ? "220px" : "260px";
  const gapSize = size === "compact" ? "gap-4" : "gap-6";
  const spaceYSize = size === "compact" ? "space-y-3" : "space-y-4";
  const thankYouTextSize =
    size === "compact" ? "text-sm" : "text-base sm:text-lg";
  const zelleTextSize = size === "compact" ? "text-xs" : "text-xs sm:text-sm";

  const content = (
    <div className={wrapped ? "space-y-6" : "space-y-8"}>
      {/* Header */}
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

      {/* Thank You Message */}
      <p
        className={`${thankYouTextSize} text-foreground/80 text-center leading-relaxed font-normal tracking-wide ${showHeader ? "" : "pt-8"}`}
      >
        If you find this tool helpful and would like to support its development,
        any contribution is greatly appreciated! I will personally reach out to
        thank whoever donated.
      </p>

      {/* Donation Options */}
      <div
        className={`grid md:grid-cols-3 ${gapSize} ${showHeader ? "pt-2" : "pt-8"}`}
      >
        {/* PayPal Card */}
        <Card className="hover:border-accent border-2 transition-colors">
          <CardContent
            className={`flex h-full flex-col items-center ${spaceYSize} p-4`}
          >
            <div className="mb-2 flex items-center justify-center">
              <img
                src="/paypal-logo.png"
                alt="PayPal"
                className={`${logoHeight} object-contain`}
              />
            </div>
            <div className="mt-auto flex w-full flex-col gap-2">
              <a
                href="https://www.paypal.com/donate/?business=XC32HWX8F5XGN&no_recurring=0&currency_code=USD"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  className={`w-full ${buttonHeight} ${buttonTextSize} gap-2 font-medium tracking-wide`}
                >
                  Open in PayPal
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Button
                variant="outline"
                className={`w-full ${buttonHeight} ${buttonTextSize} gap-2 font-medium tracking-wide`}
                onClick={() => setPaypalQrOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                Show QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Venmo Card */}
        <Card className="hover:border-accent border-2 transition-colors">
          <CardContent
            className={`flex h-full flex-col items-center ${spaceYSize} p-4`}
          >
            <div
              className="mb-2 flex items-center justify-center overflow-hidden"
              style={{ height: logoContainerHeight, maxWidth: logoMaxWidth }}
            >
              <img
                src="/venmo-logo.png"
                alt="Venmo"
                className="h-full w-auto object-contain object-center"
              />
            </div>
            <div className="mt-auto flex w-full flex-col gap-2">
              <a
                href="https://venmo.com/code?user_id=2243841549664256210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  className={`w-full ${buttonHeight} ${buttonTextSize} gap-2 font-medium tracking-wide`}
                >
                  Open in Venmo
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Button
                variant="outline"
                className={`w-full ${buttonHeight} ${buttonTextSize} gap-2 font-medium tracking-wide`}
                onClick={() => setVenmoQrOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                Show QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zelle Card */}
        <Card className="hover:border-accent border-2 transition-colors">
          <CardContent
            className={`flex h-full flex-col items-center ${spaceYSize} p-4`}
          >
            <div
              className="mb-2 flex items-center justify-center overflow-hidden"
              style={{ height: logoContainerHeight, maxWidth: logoMaxWidth }}
            >
              <img
                src="/zelle-logo.png"
                alt="Zelle"
                className="h-full w-auto object-contain object-center"
              />
            </div>
            <p
              className={`${zelleTextSize} text-muted-foreground mt-auto mb-auto text-center`}
            >
              Scan with your bank’s app
            </p>
            <div className="mt-auto flex w-full flex-col gap-2">
              <Button
                variant="outline"
                className={`w-full ${buttonHeight} ${buttonTextSize} gap-2 font-medium tracking-wide`}
                onClick={() => setZelleQrOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                Show QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const qrModals = (
    <>
      {/* PayPal QR Code Modal */}
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

      {/* Venmo QR Code Modal */}
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

      {/* Zelle QR Code Modal */}
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
        <Card className="border-primary/20 bg-primary/5 border-2">
          <CardContent className="space-y-6 p-6">{content}</CardContent>
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
