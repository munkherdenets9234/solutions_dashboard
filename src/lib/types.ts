// Shapes mirror what the live API actually returns (verified against
// solutions-service.onrender.com), not the OpenAPI spec's request examples —
// those show a nested `customer`/`booking`/`rental`/`transfer` body for
// *creating* a record, but the backend denormalizes on write: it stores the
// customer separately (only a customer_id reference remains) and flattens
// the rest onto the top-level document. There is no customers endpoint
// anywhere in the API, so a booking/rental/transfer's customer is only ever
// visible as an opaque id here.

export interface Image {
  url: string
  caption?: string
}

export interface Destination {
  id: string
  name: string
  slug: string
  overview?: string
  region?: string
  duration_days?: number
  best_seasons?: string[]
  categories?: string[]
  tags?: string[]
  featured?: boolean
  is_active?: boolean
  cover_image?: Image
  prices?: { min_people: number; max_people: number; price_usd: number }[]
}

export interface Booking {
  id: string
  destination_id: string
  customer_id: string
  travel_dates: { start: string; end: string }
  travelers: { adults: number; children: number }
  total_price_usd: number
  status: string
  payment_status?: string
  notes?: string
  created_at?: string
}

export interface Car {
  id: string
  slug: string
  name: string
  type?: string
  seats?: number
  fuel?: string
  price_per_day_usd?: number
  tags?: string[]
  cover_image?: Image
}

export interface Rental {
  id: string
  car_id: string
  customer_id: string
  mode: string
  pickup_date: string
  return_date: string
  notes?: string
  status: string
  confirmation_id?: string
  created_at?: string
}

export interface AirportTransfer {
  id: string
  customer_id: string
  tier: string
  flight_number?: string
  arrival_at: string
  passengers: number
  notes?: string
  status: string
  confirmation_id?: string
  created_at?: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  category?: string
  read_time?: number
  featured?: boolean
  excerpt?: string
  author?: { name: string; role?: string }
  date?: string
  status: string
  tags?: string[]
  cover_image?: Image
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at?: string
}

export interface TenantUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  status: string
}
