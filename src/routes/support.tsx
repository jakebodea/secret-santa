import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { SupportCard } from '../components/support-card'

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

          {/* Support Card - without header, unwrapped, default size */}
          <SupportCard 
            showHeader={false} 
            wrapped={false}
            size="default"
          />
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
    </div>
  )
}
