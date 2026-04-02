export type EventStatus = "draft" | "published" | "sold_out" | "completed" | "cancelling" | "cancelled";
export type KycStatus = "pending" | "submitted" | "verified" | "rejected";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export interface OrganizerSession {
  id: string;
  auth_user_id: string;
  user_id: string;
  display_name: string;
  slug: string;
  phone: string;
  email: string;
  country: string;
  logo_url: string | null;
  description: string | null;
  payout_phone: string | null;
  payout_method: string | null;
  kyc_status: KycStatus;
  status: string;
  created_at: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  capacity: number;
  sold_count: number;
  available?: number;
  min_per_order: number;
  max_per_order: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  venue_name: string;
  venue_address: string | null;
  venue_city: string;
  venue_country: string;
  starts_at: string;
  ends_at: string;
  doors_open_at: string | null;
  timezone: string;
  cover_image_url: string | null;
  gallery: string[];
  allow_transfers: boolean;
  allow_refunds: boolean;
  refund_deadline_hours: number;
  tags: string[];
  currency: string;
  status: EventStatus;
  tiers?: TicketTier[];
  created_at: string;
  updated_at: string;
}

export interface EventDashboard {
  event_id: string;
  status: EventStatus | null;
  total_sold: number;
  total_capacity: number;
  total_revenue: number;
  currency: string;
  check_in_count: number;
  tiers: { id: string; name: string; price: number; sold: number; capacity: number }[];
}

export interface ScanSession {
  id: string;
  event_id: string;
  gate_name: string;
  device_label: string | null;
  expires_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string;
  token?: string;
  scan_url?: string;
}

export interface ScanStats {
  total_scans: number;
  admitted: number;
}

export interface PayoutBatch {
  id: string;
  organizer_id: string;
  total_gross: number;
  total_fee: number;
  total_net: number;
  currency: string;
  status: PayoutStatus;
  provider: string;
  requested_at: string;
  processed_at: string | null;
}

export interface OrganizerBalance {
  accrued: number;
  eligible: number;
  paid: number;
  currency: string;
}

export interface AppConfig {
  categories: string[];
  currencies: string[];
  payment_methods: string[];
  fees: { percent: number; min_xof: number };
  support: { phone: string; email: string };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email: string } | null;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export interface UploadResponse {
  url: string;
  path: string;
  size: number;
  content_type: string;
}
