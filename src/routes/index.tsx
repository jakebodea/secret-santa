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
              src="/santa.svg"
              alt="Secret Santa"
              className="w-40 h-40 md:w-48 md:h-48"
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-normal text-foreground tracking-tight leading-[1.1]">
              <span className="italic font-light"> <span className="underline decoration-primary decoration-4">Super</span> Simple</span> Secret Santa
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-light tracking-wide">
              Organize your gift exchange with ease
            </p>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed font-normal tracking-wide">
            Planning a Secret Santa? We make it simple! Add your participants,
            set any rules (like who shouldn't give to whom), and let us handle
            the rest. Everyone gets assigned randomly while respecting your
            constraints.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="flex flex-col items-center space-y-3 p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-3xl font-medium text-foreground tracking-wide">Easy Setup</h3>
              <p className="text-lg text-foreground/70 text-center font-normal leading-relaxed tracking-wide">
                Add participants with just a name and email
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
                <Gift className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-3xl font-medium text-foreground tracking-wide">Smart Rules</h3>
              <p className="text-lg text-foreground/70 text-center font-normal leading-relaxed tracking-wide">
                Set constraints for who can't give to whom
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-3xl font-medium text-foreground tracking-wide">Auto Assign</h3>
              <p className="text-lg text-foreground/70 text-center font-normal leading-relaxed tracking-wide">
                Random assignments that respect all your rules
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-12">
            <Link to="/assign">
              <Button size="lg" className="text-base font-medium px-10 py-7 gap-2 tracking-wide">
                Get started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light tracking-wide">
          <p>Make your holiday gift exchange magical ✨</p>
        </div>
      </footer>
    </div>
  )
}
