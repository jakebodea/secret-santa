import { useState, useEffect } from 'react'

const MESSAGES = [
  'Gathering Santas...',
  'Checking the Nice List...',
  'Wrapping Assignments...',
  'Adding Magic...',
  'Almost Ready!',
]

const DURATION = 3000 // 3 seconds total
const MESSAGE_DURATION = DURATION / MESSAGES.length

export function AssignmentAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (currentIndex >= MESSAGES.length - 1) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsVisible(true)
      }, 150) // Half of transition duration for smooth fade
    }, MESSAGE_DURATION)

    return () => clearTimeout(timer)
  }, [currentIndex])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Bouncing Loading Dots */}
        <div className="flex justify-center items-center gap-3 h-12">
          <div 
            className="w-3 h-3 bg-primary rounded-full" 
            style={{
              animation: 'bounce-high 1s ease-in-out infinite',
              animationDelay: '0ms'
            }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary rounded-full" 
            style={{
              animation: 'bounce-high 1s ease-in-out infinite',
              animationDelay: '150ms'
            }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary rounded-full" 
            style={{
              animation: 'bounce-high 1s ease-in-out infinite',
              animationDelay: '300ms'
            }}
          ></div>
        </div>
        <style>{`
          @keyframes bounce-high {
            0% {
              transform: translateY(0);
            }
            20% {
              transform: translateY(-16px);
            }
            40% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(0);
            }
          }
        `}</style>
        
        {/* Text Message */}
        <div
          className={`transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-normal tracking-wide text-foreground">
            {MESSAGES[currentIndex]}
          </h2>
        </div>
      </div>
    </div>
  )
}

