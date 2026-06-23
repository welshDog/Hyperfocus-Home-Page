/** Shared domain types for WelshDog Designs.
 *  Column shapes mirror supabase/migrations. */

export type ProductCategory =
  | '3D Prints'
  | 'Mugs'
  | 'Gifts'
  | 'Bundles'

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
  created_at: string
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  product_id: string | null
  customer_email: string
  status: OrderStatus
  stripe_session_id: string | null
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
