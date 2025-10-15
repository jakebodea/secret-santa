import { createFileRoute, Link } from '@tanstack/react-router'
import { Gift, Users, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Secret Santa - Organize Your Gift Exchange',
      },
      {
        name: 'description',
        content:
          'Easily organize your Secret Santa gift exchange. Add participants, set constraints, and automatically assign gift recipients with our simple and fun tool.',
      },
      {
        name: 'keywords',
        content:
          'secret santa, gift exchange, christmas, holiday, gift organizer, random assignment',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <img
              src="/secret-santa-icon.svg"
              alt="Secret Santa"
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Secret Santa
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Organize your gift exchange with ease
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Planning a Secret Santa? We make it simple! Add your participants,
            set any rules (like who shouldn't give to whom), and let us handle
            the rest. Everyone gets assigned randomly while respecting your
            constraints.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Easy Setup</h3>
              <p className="text-sm text-muted-foreground text-center">
                Add participants with just a name and email
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">Smart Rules</h3>
              <p className="text-sm text-muted-foreground text-center">
                Set constraints for who can't give to whom
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Auto Assign</h3>
              <p className="text-sm text-muted-foreground text-center">
                Random assignments that respect all your rules
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Link to="/assign">
              <Button size="lg" className="text-lg px-8 py-6 gap-2">
                Get started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Make your holiday gift exchange magical ✨</p>
        </div>
      </footer>
    </div>
  )
}
