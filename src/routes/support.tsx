import { createFileRoute } from '@tanstack/react-router'
import { Heart, ExternalLink } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

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
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary fill-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-normal text-foreground tracking-tight">
              Support This Project
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto">
              Help keep Secret Santa free and ad-free for everyone
            </p>
          </div>

          {/* Thank You Message */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-lg text-foreground/80 leading-relaxed font-normal tracking-wide max-w-2xl mx-auto">
              If you find this tool helpful and would like to support its development, 
              any contribution is greatly appreciated! I will personally reach out to thank whoever donated.
            </p>
          </div>

          {/* Donation Options */}
          <div className="grid md:grid-cols-2 gap-6 pt-8">
            {/* Venmo Card */}
            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-full aspect-square max-w-[200px] bg-white rounded-lg p-2 border">
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
                  className="w-full"
                >
                  <Button className="w-full text-base font-medium gap-2 tracking-wide">
                    Open in Venmo
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Zelle Card */}
            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-full aspect-square max-w-[200px] bg-white rounded-lg p-2 border">
                  <img
                    src="/zelle.png"
                    alt="Zelle QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan with your bank's app
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light tracking-wide">
          <p>Your support helps maintain and improve this tool for everyone.</p>
          <p>Thank you for your generosity! :) </p>
        </div>
      </footer>
    </div>
  )
}
