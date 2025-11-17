import { useState } from 'react'
import { Heart, ExternalLink, QrCode } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface SupportCardProps {
  /** Whether to show the card's internal header. Defaults to true. */
  showHeader?: boolean
  /** Whether to wrap the content in a Card component. Defaults to true. */
  wrapped?: boolean
  /** Size variant for the donation cards. 'compact' for smaller (card), 'default' for larger (page). */
  size?: 'compact' | 'default'
}

export function SupportCard({ 
  showHeader = true, 
  wrapped = true,
  size = 'compact'
}: SupportCardProps) {
  const [paypalQrOpen, setPaypalQrOpen] = useState(false)
  const [venmoQrOpen, setVenmoQrOpen] = useState(false)
  const [zelleQrOpen, setZelleQrOpen] = useState(false)

  const buttonHeight = size === 'compact' ? 'h-10 sm:h-11' : 'h-11 sm:h-12'
  const buttonTextSize = size === 'compact' ? 'text-sm' : 'text-base'
  const logoHeight = size === 'compact' ? 'h-8 sm:h-10' : 'h-10 sm:h-12'
  const logoContainerHeight = size === 'compact' ? '3.5rem' : '4rem'
  const logoMaxWidth = size === 'compact' ? '220px' : '260px'
  const gapSize = size === 'compact' ? 'gap-4' : 'gap-6'
  const spaceYSize = size === 'compact' ? 'space-y-3' : 'space-y-4'
  const thankYouTextSize = size === 'compact' ? 'text-sm' : 'text-base sm:text-lg'
  const zelleTextSize = size === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'

  const content = (
    <div className={wrapped ? 'space-y-6' : 'space-y-8'}>
      {/* Header */}
      {showHeader && (
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-foreground tracking-tight">
            Support This Project
          </h2>
          <p className="text-base text-muted-foreground font-light tracking-wide">
            Help keep Secret Santa free and ad-free for everyone
          </p>
        </div>
      )}

      {/* Thank You Message */}
      <p className={`${thankYouTextSize} text-foreground/80 leading-relaxed font-normal tracking-wide text-center ${showHeader ? '' : 'pt-8'}`}>
        If you find this tool helpful and would like to support its development, 
        any contribution is greatly appreciated! I will personally reach out to thank whoever donated.
      </p>

      {/* Donation Options */}
      <div className={`grid md:grid-cols-3 ${gapSize} ${showHeader ? 'pt-2' : 'pt-8'}`}>
        {/* PayPal Card */}
        <Card className="border-2 hover:border-accent transition-colors">
          <CardContent className={`flex h-full flex-col items-center ${spaceYSize} p-4`}>
            <div className="flex items-center justify-center mb-2">
              <img
                src="/paypal-logo.png"
                alt="PayPal"
                className={`${logoHeight} object-contain`}
              />
            </div>
            <div className="flex flex-col gap-2 w-full mt-auto">
              <a 
                href="https://www.paypal.com/donate/?business=XC32HWX8F5XGN&no_recurring=0&currency_code=USD"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className={`w-full ${buttonHeight} ${buttonTextSize} font-medium gap-2 tracking-wide`}>
                  Open in PayPal
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
              <Button 
                variant="outline"
                className={`w-full ${buttonHeight} ${buttonTextSize} font-medium gap-2 tracking-wide`}
                onClick={() => setPaypalQrOpen(true)}
              >
                <QrCode className="w-4 h-4" />
                Show QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Venmo Card */}
        <Card className="border-2 hover:border-accent transition-colors">
          <CardContent className={`flex h-full flex-col items-center ${spaceYSize} p-4`}>
            <div className="flex items-center justify-center mb-2 overflow-hidden" style={{ height: logoContainerHeight, maxWidth: logoMaxWidth }}>
              <img
                src="/venmo-logo.png"
                alt="Venmo"
                className="h-full w-auto object-contain object-center"
              />
            </div>
            <div className="flex flex-col gap-2 w-full mt-auto">
              <a 
                href="https://venmo.com/code?user_id=2243841549664256210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className={`w-full ${buttonHeight} ${buttonTextSize} font-medium gap-2 tracking-wide`}>
                  Open in Venmo
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
              <Button 
                variant="outline"
                className={`w-full ${buttonHeight} ${buttonTextSize} font-medium gap-2 tracking-wide`}
                onClick={() => setVenmoQrOpen(true)}
              >
                <QrCode className="w-4 h-4" />
                Show QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zelle Card */}
        <Card className="border-2 hover:border-accent transition-colors">
          <CardContent className={`flex h-full flex-col items-center ${spaceYSize} p-4`}>
            <div className="flex items-center justify-center mb-2 overflow-hidden" style={{ height: logoContainerHeight, maxWidth: logoMaxWidth }}>
              <img
                src="/zelle-logo.png"
                alt="Zelle"
                className="h-full w-auto object-contain object-center"
              />
            </div>
            <p className={`${zelleTextSize} text-muted-foreground text-center mt-auto mb-auto`}>
              Scan with your bank's app
            </p>
            <div className="flex flex-col gap-2 w-full mt-auto">
              <Button 
                variant="outline"
                className={`w-full ${buttonHeight} ${buttonTextSize} font-medium gap-2 tracking-wide`}
                onClick={() => setZelleQrOpen(true)}
              >
                <QrCode className="w-4 h-4" />
                Show QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const qrModals = (
    <>
      {/* PayPal QR Code Modal */}
      <Dialog open={paypalQrOpen} onOpenChange={setPaypalQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>PayPal QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-full max-w-[280px] bg-white rounded-lg p-4 border mx-auto flex flex-col items-center gap-3">
              <img
                src="/paypal.png"
                alt="PayPal QR Code"
                className="w-full h-auto object-contain"
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
            <div className="w-full aspect-square max-w-[300px] bg-white rounded-lg p-3 border mx-auto">
              <img
                src="/venmo.png"
                alt="Venmo QR Code"
                className="w-full h-full object-contain"
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
            <div className="w-full aspect-square max-w-[300px] bg-white rounded-lg p-3 border mx-auto">
              <img
                src="/zelle.png"
                alt="Zelle QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan with your bank's app
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  if (wrapped) {
    return (
      <>
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-6">
            {content}
          </CardContent>
        </Card>
        {qrModals}
      </>
    )
  }

  return (
    <>
      {content}
      {qrModals}
    </>
  )
}

