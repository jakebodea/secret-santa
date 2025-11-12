import { createFileRoute, Link } from '@tanstack/react-router'
import { Zap, Heart, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { FeatureCard } from '../components/feature-card'

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
          'secret santa, simple secret santa, secret santa free, free secret santa, secret santa generator, secret santa organizer, gift exchange, christmas, holiday, gift organizer, random assignment, secret santa app',
      },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <img
              src="/santa.svg"
              alt="Secret Santa"
              className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48"
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal text-foreground tracking-tight leading-[1.1]">
              <span className="italic font-light"> <span className="underline decoration-primary decoration-4">Super</span> Simple</span> Secret Santa
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl text-muted-foreground font-light tracking-wide">
              Organize your gift exchange with this super simple tool!
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-6">
            <FeatureCard
              icon={Zap}
              title="No Accounts"
              description={
                <>
                  No signups, no logins, no hassle. Just add names and emails and <span className="underline">go</span>.
                </>
              }
              colorClass="primary"
            />
            <FeatureCard
              icon={Heart}
              title="Absolutely Free"
              description={
                <>
                  No hidden costs, no premium tiers, no upsells. <span className="underline">Free</span> forever, for everyone.
                </>
              }
              colorClass="secondary"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Privacy First"
              description={
                <>
                  Zero data stored or sold. Your info is <span className="underline">only</span> used to send assignments, then it's gone.
                </>
              }
              colorClass="accent"
            />
          </div>

          {/* CTA Button */}
          <div className="pt-12">
            <Link to="/assign">
              <Button className="h-11 px-6 sm:h-12 sm:px-8 text-base font-medium gap-2 tracking-wide">
                Get started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light tracking-wide space-y-2">
          <p>Make your holiday gift exchange magical ✨</p>
          <p>
            <Link 
              to="/support" 
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Support this project
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
