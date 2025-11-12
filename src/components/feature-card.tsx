import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: ReactNode
  colorClass: 'primary' | 'secondary' | 'accent'
}

export function FeatureCard({ icon: Icon, title, description, colorClass }: FeatureCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
  }

  return (
    <div className="flex flex-col items-center space-y-3 p-6">
      <div className={`w-14 h-14 rounded-full ${colorClasses[colorClass]} flex items-center justify-center`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-sm sm:text-base md:text-lg text-foreground/70 text-center font-normal leading-tight tracking-wide">
        {description}
      </p>
    </div>
  )
}

