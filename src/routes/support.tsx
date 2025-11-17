import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, ExternalLink, QrCode } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

export const Route = createFileRoute('/support')({
  head: () => ({
    meta: [
      {
        title: 'Support - Secret Santa',
      },
      {
        name: 'description',
        content:
          'Support the development of Secret Santa. Your contribution helps keep this tool free and available for everyone.',
      },
    ],
  }),
  component: SupportPage,
})

function SupportPage() {
  const [paypalQrOpen, setPaypalQrOpen] = useState(false)
  const [venmoQrOpen, setVenmoQrOpen] = useState(false)
  const [zelleQrOpen, setZelleQrOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary fill-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight">
              Support This Project
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto">
              Help keep Secret Santa free and ad-free for everyone
            </p>
          </div>

          {/* Thank You Message */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed font-normal tracking-wide max-w-2xl mx-auto">
              If you find this tool helpful and would like to support its development, 
              any contribution is greatly appreciated! I will personally reach out to thank whoever donated.
            </p>
          </div>

          {/* Donation Options */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {/* PayPal Card */}
            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="flex h-full flex-col items-center space-y-4">
                <div className="flex items-center justify-center mb-2">
                  <img
                    src="/paypal-logo.png"
                    alt="PayPal"
                    className="h-10 sm:h-12 object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full mt-auto">
                  <a 
                    href="https://www.paypal.com/donate/?business=XC32HWX8F5XGN&no_recurring=0&currency_code=USD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full h-11 sm:h-12 text-base font-medium gap-2 tracking-wide">
                      Open in PayPal
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button 
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-base font-medium gap-2 tracking-wide"
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
              <CardContent className="flex h-full flex-col items-center space-y-4">
                <div className="flex items-center justify-center mb-2 overflow-hidden" style={{ height: '4rem', maxWidth: '260px' }}>
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
                    <Button className="w-full h-11 sm:h-12 text-base font-medium gap-2 tracking-wide">
                      Open in Venmo
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button 
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-base font-medium gap-2 tracking-wide"
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
              <CardContent className="flex h-full flex-col items-center space-y-4">
                <div className="flex items-center justify-center mb-2 overflow-hidden" style={{ height: '4rem', maxWidth: '260px' }}>
                  <img
                    src="/zelle-logo.png"
                    alt="Zelle"
                    className="h-full w-auto object-contain object-center"
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-center mt-auto mb-auto">
                  Scan with your bank's app
                </p>
                <div className="flex flex-col gap-2 w-full mt-auto">
                  <Button 
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-base font-medium gap-2 tracking-wide"
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light tracking-wide space-y-2">
          <p>Your support helps maintain and improve this tool for everyone.</p>
          <p>Thank you for your generosity! :)</p>
          <p>
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Back to home
            </Link>
          </p>
        </div>
      </footer>

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
    </div>
  )
}
