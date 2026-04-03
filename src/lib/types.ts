export type EventStatus = "draft" | "published" | "sold_out" | "completed" | "cancelling" | "cancelled";
export type KycStatus = "pending" | "submitted" | "verified" | "rejected";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";
export type QrReleaseMode = "automatic" | "12h_before_event";
export type TicketDesignTemplate =
  | "stadium_classic"
  | "night_pulse"
  | "sunset_heat"
  | "minimal_ink";

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
  qr_release_mode: QrReleaseMode;
  ticket_design_template: TicketDesignTemplate;
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
  ticket_tiers?: TicketTier[];
  created_at: string;
  updated_at: string;
}

export interface BuyerOrder {
  id: string;
  user_id: string;
  event_id: string;
  tier_id: string;
  order_number: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  service_fee: number;
  total: number;
  currency: string;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export interface BuyerTicket {
  id: string;
  event_id: string;
  order_id: string;
  tier_id: string;
  holder_id: string;
  ticket_number: string;
  qr_payload: string | null;
  status: string;
  qr_available?: boolean;
  qr_release_at?: string | null;
  delivery_state?: string;
  entry_gates?: string[];
  ticket_url?: string | null;
  wallet_url?: string | null;
  pdf_url?: string | null;
  event?: {
    id: string;
    title: string;
    category?: string | null;
    starts_at: string;
    ends_at: string;
    doors_open_at?: string | null;
    qr_release_mode?: QrReleaseMode;
    ticket_design_template?: TicketDesignTemplate;
    venue_name?: string | null;
    venue_city?: string | null;
    venue_address?: string | null;
    cover_image_url?: string | null;
  } | null;
  tier?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  } | null;
  created_at: string;
  events?: {
    title: string;
    starts_at: string;
    venue_name: string;
    venue_city: string;
    ends_at?: string;
    doors_open_at?: string | null;
  } | null;
}

export interface PaymentStatus {
  id: string;
  order_id: string;
  status: string;
  provider: string;
  amount: number;
  currency: string;
  provider_session_id?: string | null;
  order_status?: string | null;
  delivery_state?: string;
  wallet_url?: string | null;
  ticket_ids?: string[];
  next_action?: string | null;
  qr_release_at?: string | null;
}

export interface CheckoutState {
  orderId: string;
  orderNumber: string;
  eventId: string;
  eventTitle: string;
  tierName: string;
  quantity: number;
  total: number;
  currency: string;
  paymentId: string;
  providerSessionId: string;
  waveLaunchUrl: string | null;
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

export interface StaffUser {
  id: string;
  organizer_id: string;
  phone: string;
  display_name: string;
  status: "active" | "inactive" | "deleted";
  created_at: string;
  updated_at: string;
}

export interface EventStaffAssignment {
  id: string;
  event_id: string;
  staff_user_id: string;
  role: "event_lead" | "scanner" | "support";
  allowed_gates: string[];
  status: "active" | "revoked";
  created_at: string;
  updated_at: string;
  staff_users?: StaffUser;
}

export interface ScanOpsScanner {
  session_id: string;
  session_kind: "organizer_link" | "staff_claimed";
  gate_name: string;
  device_id?: string | null;
  device_name?: string | null;
  device_label?: string | null;
  status: "active" | "paused" | "revoked";
  app_version?: string | null;
  started_at?: string | null;
  last_heartbeat_at?: string | null;
  last_used_at?: string | null;
  pending_queue_count: number;
  is_stale: boolean;
  staff_user?: StaffUser | null;
}

export interface ScanOpsAlert {
  type: string;
  session_id?: string;
  message: string;
}

export interface RecentScanEvent {
  id: string;
  scanned_at: string;
  result: "admitted" | "already_used" | "invalid" | "wrong_event" | "expired";
  ticket_id?: string | null;
  ticket_number?: string | null;
  session_id?: string | null;
  gate_name?: string | null;
  device_name?: string | null;
  staff_name?: string | null;
}

export interface ScanOpsResponse {
  event_id: string;
  stats: ScanStats;
  by_gate: {
    gate_name: string;
    admitted: number;
    total_scans: number;
    active_scanners: number;
  }[];
  scanners: ScanOpsScanner[];
  roster: EventStaffAssignment[];
  recent_scans: RecentScanEvent[];
  alerts: ScanOpsAlert[];
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
