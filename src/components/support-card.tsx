import { Heart, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

export function SupportCard() {
  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
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

        {/* Thank You Message */}
        <p className="text-sm text-foreground/80 leading-relaxed font-normal tracking-wide text-center">
          If you find this tool helpful and would like to support its development, 
          any contribution is greatly appreciated! I will personally reach out to thank whoever donated.
        </p>

        {/* Donation Options */}
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          {/* PayPal Card */}
          <Card className="border-2 hover:border-accent transition-colors">
            <CardContent className="flex h-full flex-col items-center space-y-3 p-4">
              <div className="w-full max-w-[100px] sm:max-w-[120px] bg-white rounded-lg p-3 border mx-auto flex flex-col items-center gap-2">
                <img
                  src="/paypal.png"
                  alt="PayPal QR Code"
                  className="w-full h-auto object-contain"
                />
                <img
                  src="/paypal-logo.png"
                  alt="PayPal"
                  className="h-7 object-contain"
                />
              </div>
              <a 
                href="https://www.paypal.com/donate/?business=XC32HWX8F5XGN&no_recurring=0&currency_code=USD"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-auto"
              >
                <Button className="w-full h-10 sm:h-11 text-sm font-medium gap-2 tracking-wide">
                  Open in PayPal
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Venmo Card */}
          <Card className="border-2 hover:border-accent transition-colors">
            <CardContent className="flex h-full flex-col items-center space-y-3 p-4">
              <div className="w-full aspect-square max-w-[120px] sm:max-w-[150px] bg-white rounded-lg p-2 border">
                <img
                  src="/venmo.png"
                  alt="Venmo QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <a 
                href="https://venmo.com/code?user_id=2243841549664256210"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-auto"
              >
                <Button className="w-full h-10 sm:h-11 text-sm font-medium gap-2 tracking-wide">
                  Open in Venmo
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Zelle Card */}
          <Card className="border-2 hover:border-accent transition-colors">
            <CardContent className="flex flex-col items-center space-y-3 p-4">
              <div className="w-full aspect-square max-w-[120px] sm:max-w-[150px] bg-white rounded-lg p-2 border">
                <img
                  src="/zelle.png"
                  alt="Zelle QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan with your bank's app
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

