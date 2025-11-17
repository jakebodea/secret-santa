import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

type TimelineEntry = {
  date: string
  title: string
  content: string
}

const timelineData: TimelineEntry[] = [
  {
    date: 'November 17, 2025',
    title: 'Changelog Page',
    content: `
      <h3>New Features</h3>
      <ul>
        <li>Added dedicated changelog page at "/changelog" to track version history and updates</li>
        <li>Implemented timeline view to showcase project evolution</li>
      </ul>
    `,
  },
  {
    date: 'November 17, 2025',
    title: 'Mobile Experience Improvements',
    content: `
      <h3>Results Page Enhancement</h3>
      <ul>
        <li>Improved mobile formatting for the results display</li>
        <li>Better integration of party names throughout the results page</li>
      </ul>
    `,
  },
  {
    date: 'November 16, 2025',
    title: 'Support Page & UI Polish',
    content: `
      <h3>Support & Donations</h3>
      <ul>
        <li>Added PayPal as a donation option to support development</li>
        <li>Restructured and redesigned the support page for better clarity</li>
        <li>Refactored code to improve maintainability</li>
      </ul>
      <h3>Visual Improvements</h3>
      <ul>
        <li>Enhanced exclusion list layout with better visual centering</li>
        <li>Refined dialog header styling for improved readability</li>
      </ul>
    `,
  },
  {
    date: 'November 12, 2025',
    title: 'Interactive Santa Easter Egg',
    content: `
      <h3>Playful Additions</h3>
      <ul>
        <li>Introduced a hidden playful Santa animation on mobile devices</li>
        <li>Added tap interactions to reveal Santa's playful personality</li>
        <li>Refined Santa illustration details for a more polished appearance</li>
      </ul>
    `,
  },
  {
    date: 'November 11, 2025',
    title: 'Major UI Overhaul & Animations',
    content: `
      <h3>Home Page Redesign</h3>
      <ul>
        <li>Implemented smooth animations using Framer Motion for a delightful first impression</li>
        <li>Created custom feature cards to showcase key benefits</li>
        <li>Redesigned the home page layout for better mobile responsiveness</li>
      </ul>
      <h3>New Illustrations</h3>
      <ul>
        <li>Added multiple Santa illustrations including an animated "open eyes" variant</li>
        <li>Introduced interactive hover effects on Santa character</li>
      </ul>
      <h3>Technical Improvements</h3>
      <ul>
        <li>Updated exclusion rules layout for better usability</li>
        <li>Enhanced cache clearing on page reload and "Get Started" action</li>
        <li>Improved post-email confirmation display</li>
      </ul>
    `,
  },
  {
    date: 'November 9, 2025',
    title: 'Import Features & Input Enhancements',
    content: `
      <h3>File Import Support</h3>
      <ul>
        <li>Added CSV and Excel file import functionality for bulk participant entry</li>
        <li>Streamlined the process of adding multiple participants at once</li>
      </ul>
      <h3>User Experience</h3>
      <ul>
        <li>Introduced automatic Title Case formatting for party and player names</li>
        <li>Implemented automatic space removal from email inputs to prevent errors</li>
        <li>Updated gift icon to a more modern design</li>
        <li>Added visual emphasis with red underlines for party names</li>
      </ul>
      <h3>Email & Technical</h3>
      <ul>
        <li>Added email cooldown logic to prevent spam</li>
        <li>Improved SEO optimization</li>
        <li>Enhanced mobile view responsiveness</li>
      </ul>
    `,
  },
  {
    date: 'November 8, 2025',
    title: 'Party Names & Support Integration',
    content: `
      <h3>New Features</h3>
      <ul>
        <li>Introduced party naming feature to personalize your Secret Santa event</li>
        <li>Added dedicated support page with donation options</li>
        <li>Integrated support links throughout the application</li>
      </ul>
      <h3>Improvements</h3>
      <ul>
        <li>Cleaned up and improved email templates</li>
        <li>Reorganized email submission flow for better clarity</li>
        <li>Refined feature card text on the main page</li>
      </ul>
    `,
  },
  {
    date: 'November 6, 2025',
    title: 'User Control & Branding Updates',
    content: `
      <h3>New Functionality</h3>
      <ul>
        <li>Added "Clear All" buttons for quick reset of participants and constraints</li>
        <li>Updated application favicon to feature the new Santa logo</li>
      </ul>
      <h3>Visual Identity</h3>
      <ul>
        <li>Introduced new Santa SVG illustration as the primary brand icon</li>
        <li>Integrated Santa branding throughout the application</li>
      </ul>
    `,
  },
  {
    date: 'November 3, 2025',
    title: 'Results Page Redesign',
    content: `
      <h3>Enhanced Privacy & Usability</h3>
      <ul>
        <li>Redesigned results page to allow viewing individual assignments</li>
        <li>Added ability to peek at one participant's assignment instead of revealing all at once</li>
        <li>Cleaned up results display for better readability</li>
      </ul>
    `,
  },
  {
    date: 'November 1, 2025',
    title: 'Assignment Flow Improvements',
    content: `
      <h3>User Experience Enhancement</h3>
      <ul>
        <li>Hidden assignments during the main setup flow for better surprise factor</li>
        <li>Added smooth animations to the assignment generation process</li>
        <li>Improved overall flow and transitions</li>
      </ul>
    `,
  },
  {
    date: 'October 28, 2025',
    title: 'Email Functionality Launch',
    content: `
      <h3>Major Feature: Email Integration</h3>
      <ul>
        <li>Integrated Resend email service for automated assignment delivery</li>
        <li>Created beautiful email templates for Secret Santa assignments</li>
        <li>Built admin results page with secure base64-encoded assignment viewing</li>
        <li>Added comprehensive project planning documentation</li>
      </ul>
    `,
  },
  {
    date: 'October 27, 2025',
    title: 'Code Organization',
    content: `
      <h3>Technical Improvements</h3>
      <ul>
        <li>Renamed files to follow kebab-case convention for consistency</li>
        <li>Improved overall code organization and maintainability</li>
      </ul>
    `,
  },
  {
    date: 'October 16, 2025',
    title: 'Production Optimization',
    content: `
      <h3>Build & Deploy Improvements</h3>
      <ul>
        <li>Optimized production build by conditionally loading developer tools</li>
        <li>Moved development dependencies for smaller bundle size</li>
        <li>Updated icons and removed outdated assets</li>
        <li>Enhanced overall styling throughout the application</li>
      </ul>
    `,
  },
  {
    date: 'October 15, 2025',
    title: 'Deployment Setup',
    content: `
      <h3>Infrastructure</h3>
      <ul>
        <li>Configured Cloudflare deployment for global edge distribution</li>
        <li>Set up continuous deployment pipeline</li>
      </ul>
    `,
  },
  {
    date: 'October 14, 2025',
    title: 'Initial Release',
    content: `
      <h3>Core Features Launched</h3>
      <ul>
        <li>Built complete Secret Santa application from the ground up</li>
        <li>Implemented participant management with add/remove functionality</li>
        <li>Created constraint system for exclusion rules</li>
        <li>Developed smart assignment algorithm that respects all constraints</li>
        <li>Added admin functionality for organizers</li>
        <li>Designed modern, responsive user interface</li>
        <li>Set up GitHub Actions for automated deployment</li>
        <li>Established custom domain configuration</li>
      </ul>
      <h3>Technology Stack</h3>
      <ul>
        <li>Built with TanStack Start for modern React framework</li>
        <li>Implemented responsive design for all devices</li>
        <li>Created beautiful, intuitive user experience</li>
      </ul>
    `,
  },
]

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: [
      {
        title: 'Changelog - Secret Santa',
      },
      {
        name: 'description',
        content: 'View the changelog and version history for Secret Santa.',
      },
    ],
  }),
  component: ChangelogPage,
})

function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <section className="bg-background py-8">
          <div className="container">
            <div className="flex flex-col items-center mb-10">
              <img
                src="/santa-playful.svg"
                alt="Playful Santa"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4"
              />
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight text-center">
                Changelog
              </h1>
            </div>
            <div className="relative mx-auto max-w-4xl">
              <Separator
                orientation="vertical"
                className="bg-foreground/30 absolute left-2 top-4"
              />
              {timelineData.map((entry, index) => (
                <div key={index} className="relative mb-12 pl-8">
                  <div className="bg-secondary absolute left-0 top-3.5 flex size-4 items-center justify-center rounded-full" />
                  <h4 className="text-2xl sm:text-3xl leading-none font-medium py-2 xl:mb-2 xl:px-3">
                    {entry.title}
                  </h4>

                  <h5 className="text-2xl sm:text-3xl text-muted-foreground tracking-tight mb-4 xl:mb-0 xl:absolute xl:-left-44 xl:top-2 xl:w-36 xl:text-right xl:leading-none">
                    {entry.date}
                  </h5>

                  <div className="my-4 xl:px-3 space-y-4">
                      <div
                      className="changelog-content text-foreground"
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

