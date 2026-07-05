/** Shared domain types for WelshDog Designs.
 *  Column shapes mirror supabase/migrations. */

export type ProductCategory =
  | '3D Prints'
  | 'Mugs'
  | 'Gifts'
  | 'Bundles'
  | 'Apparel'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  images: string[]
  category: ProductCategory | string
  stock: number
  active: boolean
  /** When set, the product is fulfilled externally (e.g. Teemill) — the shop
   *  links out to buy instead of using Stripe checkout. */
  external_url: string | null
  /** Default Teemill variant to fulfil when sold via our own Stripe checkout. */
  teemill_variant_id: string | null
  created_at: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'needs_fulfilment'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  product_id: string | null
  customer_email: string
  status: OrderStatus
  amount: number | null
  stripe_session_id: string | null
  fulfilled: boolean
  teemill_order_id: string | null
  created_at: string
}

export type WhiteLabelTier = 'Starter' | 'Pro' | 'Done For You'

export interface Lead {
  id: string
  name: string
  email: string
  tier: WhiteLabelTier | string | null
  message: string | null
  created_at: string
}

export type BlogCategory =
  | 'ADHD & Neurodiversity'
  | 'Dyslexia'
  | 'Tech & AI'
  | 'Creativity'
  | 'Personal'

export interface BlogPost {
  id: string
  slug: string
  title: string
  category: BlogCategory | string | null
  tags: string[]
  excerpt: string | null
  published: boolean
  published_at: string | null
}

export interface Subscriber {
  id: string
  email: string
  created_at: string
}

export interface PlaylistTrack {
  id: string
  title: string
  artist: string
  /** Must exactly match `storage.objects.name` in the `music` bucket. */
  audio_path: string
  duration_seconds: number | null
  sort_order: number
  is_published: boolean
  created_at: string
}

/** Admin view of a track — DB row plus whether the referenced file
 *  actually exists in the `music` Storage bucket. */
export type AdminPlaylistTrack = PlaylistTrack & { storage_exists: boolean }

export interface TrackComment {
  id: string
  track_id: string
  /** Client-generated device UUID — anonymous, not a user id. */
  anon_id: string
  display_name: string
  body: string
  is_hidden: boolean
  created_at: string
}

/** Admin view of a comment — row plus its track title for the moderation table. */
export type AdminTrackComment = TrackComment & { track_title: string }

/** Row shape of the `track_public_stats` view (published tracks only). */
export interface TrackPublicStats {
  track_id: string
  like_count: number
  comment_count: number
  play_count: number
}
