interface GuideEntry {
  name: string
  path: string
  purpose: string
  actions: string[]
  note?: string
}

interface GuideSection {
  heading: string
  entries: GuideEntry[]
}

const GUIDE: GuideSection[] = [
  {
    heading: 'Overview',
    entries: [
      {
        name: 'Dashboard',
        path: '/',
        purpose: 'A quick snapshot of how the business is doing.',
        actions: [
          'See summary tiles for total bookings, revenue, active tours, and new inquiries.',
          'View a chart of bookings by month.',
          'Browse recent bookings and click into any of them for details.',
        ],
        note: 'Revenue and the chart are estimated from the most recent 100 bookings, so treat them as a general trend rather than an exact total.',
      },
    ],
  },
  {
    heading: 'Manage',
    entries: [
      {
        name: 'Tours',
        path: '/tours',
        purpose: 'The destination and tour packages shown on the website.',
        actions: [
          'Add a new tour, or edit an existing one.',
          'Set the name, region, duration, overview, categories, tags, and best seasons.',
          'Upload a cover photo and mark a tour as featured.',
          'Delete a tour you no longer offer, from its edit page.',
        ],
        note: 'Only active tours appear in this list.',
      },
      {
        name: 'Customers',
        path: '/customers',
        purpose: "Look up a customer's contact details and history.",
        actions: [
          'Search by name, email, or phone number.',
          "Open a customer to see all of their bookings, rentals, and airport transfers in one place.",
        ],
        note: 'This section is view-only, and only visible to the main admin account, not regular staff.',
      },
      {
        name: 'Bookings',
        path: '/bookings',
        purpose: 'Tour bookings made by customers.',
        actions: [
          'Search by booking ID, tour, customer name, or status.',
          'Open a booking to see traveler counts, price, payment status, and notes.',
          'Move a booking forward using the status buttons: Pending → Confirmed or Cancelled, then Confirmed → Completed or Cancelled.',
        ],
        note: 'Bookings come from the website and cannot be created or edited manually here — this page is for tracking and updating status only.',
      },
      {
        name: 'Rentals',
        path: '/rentals',
        purpose: 'Self-drive car rental bookings.',
        actions: [
          'Open a rental to see pickup/return dates, confirmation ID, and notes.',
          'Update its status the same way as bookings (Pending → Confirmed/Cancelled → Completed).',
        ],
        note: 'View and status tracking only — no manual create or edit.',
      },
      {
        name: 'Airport Transfers',
        path: '/airport-transfers',
        purpose: 'Airport pickup and drop-off bookings.',
        actions: [
          'Open a transfer to see the service tier, flight number, passenger count, and arrival time.',
          'Update its status the same way as bookings.',
        ],
        note: 'View and status tracking only — no manual create or edit.',
      },
      {
        name: 'Cars',
        path: '/cars',
        purpose: 'The rental car fleet listed on the website.',
        actions: [
          'Add a new car, or edit an existing one.',
          'Set the name, type, fuel, seats, price per day, and tags.',
          'Upload a cover photo.',
          'Delete a car that is no longer available to rent.',
        ],
      },
      {
        name: 'Blog',
        path: '/blog',
        purpose: 'Articles published on the website.',
        actions: [
          'Create a new post, then fill in the title, category, read time, excerpt, content, tags, and cover image.',
          'Mark a post as featured.',
          'Publish a draft from its edit page once it is ready to go live.',
        ],
        note: "A new post starts as a draft and won't appear on the website, or in this list, until you click Publish.",
      },
      {
        name: 'Partners',
        path: '/partners',
        purpose: 'Partner businesses (accommodation, dining, etc.) shown on the website.',
        actions: [
          'Add a new partner, or edit an existing one.',
          'Set the name, tag, title, description, and website URL.',
          'Upload a partner image, and an image for each product/offering listed under them.',
          'Pick a featured review to highlight on the partner\'s page.',
          'Deactivate a partner from its edit page when they are no longer featured.',
        ],
        note: 'Deactivating a partner hides it from the website but keeps the record — it is not permanently deleted.',
      },
      {
        name: 'Reviews',
        path: '/reviews',
        purpose: 'Customer reviews shown on the website.',
        actions: [
          'Add a new review, or edit an existing one.',
          'Set the star rating (1–5) and the review text.',
          'Optionally link the review to a customer, tour, and/or partner using the dropdowns.',
        ],
        note: 'Deleting a review from its edit page removes it permanently.',
      },
      {
        name: 'Contact Messages',
        path: '/contact-messages',
        purpose: "Messages submitted through the website's contact form.",
        actions: [
          'Read a message.',
          'Mark its status as it’s handled: New → Read → Responded.',
        ],
        note: 'This only tracks that a message was seen and answered — you still need to reply to the customer by email yourself.',
      },
    ],
  },
  {
    heading: 'System',
    entries: [
      {
        name: 'Staff',
        path: '/staff',
        purpose: 'Login accounts for people who use this admin dashboard.',
        actions: [
          'Create a new staff account with a name, email, and role.',
          'Suspend an account to block that person from logging in, or reactivate it later.',
          'Reset a staff member’s password and hand them the new one.',
        ],
      },
      {
        name: 'Settings',
        path: '/settings',
        purpose: 'Your own account settings.',
        actions: ['Change your own password.'],
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">Help &amp; Instructions</h1>
        <p className="text-[13px] text-body mt-1">
          A quick guide to what each page in this admin dashboard does and how to use it.
        </p>
      </div>

      {GUIDE.map((section) => (
        <div key={section.heading} className="flex flex-col gap-3">
          <div className="text-[11px] font-semibold text-muted tracking-wider uppercase">
            {section.heading}
          </div>
          {section.entries.map((entry) => (
            <div
              key={entry.path}
              className="border border-hairline rounded-[10px] bg-panel p-5 flex flex-col gap-2.5"
            >
              <div className="flex items-baseline gap-2">
                <div className="font-bold text-[15px]">{entry.name}</div>
                <div className="text-[11px] text-muted font-mono">{entry.path}</div>
              </div>
              <p className="text-[13px] text-body">{entry.purpose}</p>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                {entry.actions.map((action) => (
                  <li key={action} className="text-[13px] text-body">
                    {action}
                  </li>
                ))}
              </ul>
              {entry.note && (
                <p className="text-[12.5px] text-muted italic">{entry.note}</p>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <div className="text-[11px] font-semibold text-muted tracking-wider uppercase">
          Understanding status colors
        </div>
        <div className="border border-hairline rounded-[10px] bg-panel p-5 flex flex-col gap-2">
          <p className="text-[13px] text-body">
            Wherever you see a colored status pill, it follows the same meaning across the whole dashboard:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li className="text-[13px] text-body">
              <span className="font-semibold">Green</span> — confirmed, completed, active, or published.
            </li>
            <li className="text-[13px] text-body">
              <span className="font-semibold">Yellow</span> — pending, draft, or new (not yet actioned).
            </li>
            <li className="text-[13px] text-body">
              <span className="font-semibold">Red</span> — cancelled or suspended.
            </li>
          </ul>
          <p className="text-[12.5px] text-muted italic">
            Buttons to change status only show the next steps that are actually available — a completed or
            cancelled item has none, since those are final.
          </p>
        </div>
      </div>
    </div>
  )
}
