// Shapes mirror what the live API actually returns (verified against
// solutions-service.onrender.com), not the OpenAPI spec's request examples —
// those show a nested `customer`/`booking`/`rental`/`transfer` body for
// *creating* a record, but the backend denormalizes on write: it stores the
// customer separately (only a customer_id reference remains) and flattens
// the rest onto the top-level document. A booking/rental/transfer record
// itself only ever exposes customer_id — resolving the name/email requires
// the dedicated /admin/customers endpoints (see Customer/CustomerDetail).

export interface Image {
  url: string
  caption?: string
}

export interface Departure {
  start_date: string
  end_date: string
  available: boolean
}

export interface ItineraryDay {
  day: number
  title: string
  description?: string
  activities?: string[]
  overnight?: string
  meals?: string[]
}

export interface Destination {
  id: string
  name: string
  slug: string
  overview?: string
  region?: string
  duration_days?: number
  best_seasons?: string[]
  departures?: Departure[]
  highlights?: string[]
  activities?: string[]
  inclusions?: string[]
  exclusions?: string[]
  itinerary?: ItineraryDay[]
  accommodation?: string
  meal_plan?: string
  difficulty?: string
  categories?: string[]
  tags?: string[]
  featured?: boolean
  is_active?: boolean
  cover_image?: Image
  images?: Image[]
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
  content?: string
  author?: { name: string; role?: string }
  date?: string
  status: string
  tags?: string[]
  cover_image?: Image
}

export interface PartnerProduct {
  name: string
  image?: string
  description?: string
}

export interface Partner {
  id: string
  name: string
  slug: string
  tag?: string
  title?: string
  description?: string
  // Plain URL string, unlike the { url, caption } Image object other resources use.
  image?: string
  web_url?: string
  products?: PartnerProduct[]
  related_review?: string
  is_active?: boolean
  created_at?: string
}

export interface Review {
  id: string
  star: number
  review: string
  related_customer?: string
  related_tour?: string
  related_partner?: string
  created_at?: string
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

interface CustomerBase {
  id: string
  name: string
  email: string
  phone: string
  nationality?: string
  notes?: string
  created_at?: string
}

// List view — /admin/customers returns each customer with counts of its
// related records instead of the records themselves.
export interface Customer extends CustomerBase {
  booking_count: number
  rental_count: number
  airport_transfer_count: number
}

// Detail view — /admin/customers/:id expands the full related records
// instead of counts.
export interface CustomerDetail extends CustomerBase {
  bookings: Booking[]
  rentals: Rental[]
  airport_transfers: AirportTransfer[]
}
