import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Zap, Heart, ShieldCheck, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { FeatureCard } from '../components/feature-card'

const featureRevealDelay = 2.65
const buttonRevealDelay = featureRevealDelay + 0.25
const animationsCompleteDelay = buttonRevealDelay + 0.7 // After button animation completes

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
  const [animationsComplete, setAnimationsComplete] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsComplete(true)
    }, animationsCompleteDelay * 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <motion.img
              src={isHovered ? '/santa-playful.svg' : '/santa.svg'}
              alt="Secret Santa"
              className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 cursor-pointer transition-all"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: isHovered && animationsComplete ? 1.15 : 1,
                x: isHovered && animationsComplete ? [0, -20, 20, -18, 18, -15, 15, -12, 12, -8, 8, -5, 5, 0] : 0,
                rotate: isHovered && animationsComplete ? [0, -12, 12, -10, 10, -8, 8, -6, 6, -4, 4, -2, 2, 0] : 0,
              }}
              transition={{
                opacity: { duration: 0.8, ease: 'easeOut', delay: 0.1 },
                scale: { duration: 0.3, ease: 'easeOut' },
                x: {
                  duration: 2,
                  ease: 'easeOut',
                  times: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
                },
                rotate: {
                  duration: 2,
                  ease: 'easeOut',
                  times: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1],
                },
              }}
              onMouseEnter={() => {
                if (animationsComplete) {
                  setIsHovered(true)
                }
              }}
              onMouseLeave={() => {
                setIsHovered(false)
              }}
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-normal text-foreground tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
            >
              <span className="italic font-light"> <span className="underline decoration-primary decoration-4">Super</span> Simple</span> Secret Santa
            </motion.h1>
            <motion.p
              className="text-lg sm:text-2xl md:text-3xl text-muted-foreground font-light tracking-wide"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.45 }}
            >
              Organize your gift exchange with this super simple tool!
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            className="grid md:grid-cols-3 gap-2 sm:gap-8 pt-0 sm:pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: featureRevealDelay, duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: featureRevealDelay, duration: 0.6, ease: 'easeOut' }}
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: featureRevealDelay, duration: 0.6, ease: 'easeOut' }}
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: featureRevealDelay, duration: 0.6, ease: 'easeOut' }}
            >
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
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="pt-8 sm:pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: buttonRevealDelay }}
          >
            <Link to="/assign">
              <Button className="h-11 px-6 sm:h-12 sm:px-8 text-base font-medium gap-2 tracking-wide">
                Get started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-20 py-6 sm:py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light tracking-wide space-y-2">
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
