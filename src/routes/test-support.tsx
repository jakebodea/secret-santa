import { createFileRoute } from '@tanstack/react-router'
import { SupportCard } from '../components/support-card'

export const Route = createFileRoute('/test-support')({
  head: () => ({
    meta: [
      {
        title: 'Test Support - Secret Santa',
      },
      {
        name: 'description',
        content: 'Test page for the support card component',
      },
    ],
  }),
  component: TestSupportPage,
})

function TestSupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground tracking-tight mb-8 text-center">
            Test Support Card
          </h1>
          <SupportCard />
        </div>
      </main>
    </div>
  )
}
