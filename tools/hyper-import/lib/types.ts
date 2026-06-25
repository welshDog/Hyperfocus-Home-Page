/**
 * HyperImport — adapter contract.
 *
 * Every platform (Teemill, Shopify, CSV, any-URL, …) is just an ImportAdapter.
 * Adding a new source = drop in one file that exports one of these and register
 * it in registry.ts. Nothing else changes.
 */

import type { ImportedProduct } from './mapper'

export type ConnectInput = {
  /** A shop or product page URL. */
  url?: string
  /** Platform API key / token / feed URL. */
  apiKey?: string
  /** Raw CSV text (for the CSV adapter). */
  csv?: string
}

export interface ImportAdapter {
  id: string
  label: string
  /** Confidence 0–1 that this adapter can handle the given input. */
  detect(input: ConnectInput): Promise<number>
  /** Fetch + normalise products into the shared shape. */
  connect(input: ConnectInput): Promise<ImportedProduct[]>
}
