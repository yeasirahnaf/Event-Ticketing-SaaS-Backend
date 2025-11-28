# Event Ticketing SaaS Implementation Plan

This document explains the four user types, the database structure, and the main features in straightforward language so the team can use it as an execution blueprint.

## Core Personas

- **admin** looks after the entire platform: tenants, compliance, and health monitoring.
- **TenantAdmin** (organizer owner) configures branding, events, tickets, discounts, and reports for a single tenant.
- **Staff** focuses on on-site operations such as check-in and attendee support.
- **User** (attendee) browses public events, purchases tickets, and stores QR passes.

## Database Structure Overview (Student-Friendly)

Think of the database as different notebooks, each keeping track of a part of the platform:

- **Tenants** (`tenants`): every organizer/brand gets one row here with its name, slug, and branding colors.
- **Users** (`users`): everyone who can log into the system (admin, TenantAdmin, staff) lives here with email + password hash.
- **Tenant Users** (`tenant_users`): a simple link that says "this user belongs to this tenant with the role TenantAdmin/staff."
- **Events** (`events`): every event an organizer creates, including venue, schedule, status, and public slug.
- **Event Sessions** (`event_sessions`): optional mini-blocks if an event has multiple days or time slots.
- **Ticket Types** (`ticket_types`): each pricing tier (VIP, GA, Early Bird) with its price, currency, and total quantity.
- **Orders** (`orders`): the shopping cart summary for a buyer (which event, total cost, payment status).
- **Order Items** (`order_items`): break the order into the exact ticket types and quantities purchased.
- **Tickets** (`tickets`): one row per seat/QR code so we know each attendee and can mark them checked-in.
- **Payments** (`payments`): record the Stripe payment intent or charge reference so finance can reconcile.
- **Discount Codes** (`discount_codes`): optional promos; keep the code, expiry, and how many times it was used.
- **Webhook Events** (`webhook_events`): keep raw Stripe/email callbacks for debugging and retries.
- **Activity Logs** (`activity_logs`): store "who did what" (e.g., staff checked in a guest, TenantAdmin edited an event).

| Domain | Table | Purpose | Important Columns |
| --- | --- | --- | --- |
| Identity | `tenants` | Organizer accounts | `id`, `name`, `slug`, `branding_settings`, timestamps |
| Identity | `tenant_users` | Maps platform users to tenants with roles | `id`, `tenant_id`, `user_id`, `role`, `status` |
| Identity | `users` | Global user records | `id`, `email`, `password_hash`, `full_name`, `is_platform_admin` |
| Events | `events` | Event definitions | `id`, `tenant_id`, `slug`, `status`, `venue`, `start_at`, `end_at` |
| Events | `event_sessions` | Session blocks for multi-day events | `id`, `event_id`, `start_at`, `end_at`, `title` |
| Ticketing | `ticket_types` | Pricing tiers | `id`, `event_id`, `name`, `price_cents`, `currency`, `quantity_total`, `quantity_sold` |
| Orders | `orders` | Overall checkout records | `id`, `tenant_id`, `event_id`, `buyer_email`, `total_cents`, `status`, `payment_intent_id` |
| Orders | `order_items` | Line items under an order | `id`, `order_id`, `ticket_type_id`, `unit_price_cents`, `quantity` |
| Tickets | `tickets` | Individual QR passes | `id`, `order_id`, `ticket_type_id`, `attendee_name`, `qr_code_payload`, `checked_in_at` |
| Payments | `payments` | Provider transactions | `id`, `order_id`, `provider`, `provider_reference`, `status`, `payload` |
| Discounts | `discount_codes` | Optional promotions | `id`, `event_id`, `code`, `max_redemptions`, `times_redeemed`, `expires_at` |
| Operations | `webhook_events` | Raw webhook storage | `id`, `provider`, `event_type`, `payload`, `received_at`, `processed_at`, `status` |
| Audit | `activity_logs` | Staff/TenantAdmin actions | `id`, `tenant_id`, `actor_id`, `action`, `metadata` |

## Tables Used by Each User Type

### admin Tables

- `users` (to manage platform-level accounts and admins).
- `tenants` (review tenant onboarding, suspend/reactivate tenants).
- `tenant_users` (see who belongs to each tenant and their role).
- `webhook_events` (inspect Stripe or mailer callbacks).
- `payments` (audit payouts and failed charges globally).
- `activity_logs` (audit actions performed by TenantAdmins/staff).

### TenantAdmin Tables (Data)

- `tenants` (update tenant branding settings).
- `events` and `event_sessions` (create, edit, publish, archive events).
- `ticket_types` (define pricing tiers and inventory).
- `discount_codes` (optional promotions managed per event).
- `orders`, `order_items`, `payments` (view sales, handle refunds or resends).
- `tickets` (inspect attendee tickets, resend QR codes).
- `tenant_users` (invite and manage staff roles).
- `activity_logs` (review staff actions inside the tenant).

### Staff Tables (Data)

- `events` and `ticket_types` (read-only access for assignments and capacity checks).
- `tickets` (scan QR payloads, update `checked_in_at`).
- `orders` (look up attendees by email or order code).
- `activity_logs` (write simple incident reports tied to an event).

### User Tables

- `events`, `event_sessions`, `ticket_types` (public-facing read access).
- `orders` and `order_items` (own order history tied to buyer email).
- `tickets` (QR codes stored per attendee).
- `discount_codes` (look up promo validity at checkout).
- `payments` (indirectly referenced for receipt and status emails).

## Table Details and Relationships

### admin-Facing Tables

| Table | Columns |
| --- | --- |
| `users` | `id`, `email`, `password_hash`, `full_name`, `is_platform_admin`, `created_at`, `updated_at` |
| `tenants` | `id`, `name`, `slug`, `branding_settings`, `status`, `created_at`, `updated_at` |
| `tenant_users` | `id`, `tenant_id`, `user_id`, `role`, `status`, `invited_at`, `last_login_at` |
| `webhook_events` | `id`, `provider`, `event_type`, `payload`, `received_at`, `processed_at`, `status`, `error_message` |
| `payments` | `id`, `order_id`, `provider`, `provider_reference`, `status`, `amount_cents`, `currency`, `processed_at`, `payload` |
| `activity_logs` | `id`, `tenant_id`, `actor_id`, `action`, `metadata`, `created_at` |

#### admin Relations

- `tenant_users.user_id` → `users.id` (many tenant memberships per user).
- `tenant_users.tenant_id` → `tenants.id`.
- `payments.order_id` → `orders.id` (Orders table defined below).
- `activity_logs.actor_id` → `users.id`, `activity_logs.tenant_id` → `tenants.id`.

### TenantAdmin Tables (Details)

| Table | Columns |
| --- | --- |
| `tenants` | same as above |
| `events` | `id`, `tenant_id`, `name`, `slug`, `description`, `venue`, `city`, `country`, `start_at`, `end_at`, `status`, `is_public`, `seo_meta`, `created_at`, `updated_at` |
| `event_sessions` | `id`, `event_id`, `title`, `description`, `start_at`, `end_at` |
| `ticket_types` | `id`, `event_id`, `name`, `description`, `price_cents`, `currency`, `quantity_total`, `quantity_sold`, `sales_start`, `sales_end`, `status` |
| `discount_codes` | `id`, `event_id`, `code`, `description`, `max_redemptions`, `times_redeemed`, `discount_type`, `discount_value`, `starts_at`, `expires_at`, `status` |
| `orders` | `id`, `tenant_id`, `event_id`, `buyer_email`, `buyer_name`, `total_cents`, `currency`, `status`, `payment_intent_id`, `created_at`, `updated_at` |
| `order_items` | `id`, `order_id`, `ticket_type_id`, `unit_price_cents`, `quantity`, `subtotal_cents` |
| `tickets` | `id`, `order_id`, `ticket_type_id`, `attendee_name`, `attendee_email`, `qr_code_payload`, `qr_signature`, `status`, `checked_in_at`, `seat_label` |
| `tenant_users` | same as above |
| `activity_logs` | same as above |
| `payments` | same as above |

#### TenantAdmin Relations

- `events.tenant_id` → `tenants.id`.
- `event_sessions.event_id` → `events.id`.
- `ticket_types.event_id` → `events.id`.
- `discount_codes.event_id` → `events.id`.
- `orders.tenant_id` → `tenants.id`, `orders.event_id` → `events.id`.
- `order_items.order_id` → `orders.id`, `order_items.ticket_type_id` → `ticket_types.id`.
- `tickets.order_id` → `orders.id`, `tickets.ticket_type_id` → `ticket_types.id`.
- `payments.order_id` → `orders.id`.

### Staff Tables (Details)

| Table | Columns |
| --- | --- |
| `events` | read columns listed above |
| `ticket_types` | read columns listed above |
| `orders` | read subset: `id`, `event_id`, `buyer_email`, `status`, `created_at` |
| `tickets` | `id`, `order_id`, `ticket_type_id`, `attendee_name`, `qr_code_payload`, `status`, `checked_in_at`, `seat_label` |
| `activity_logs` | `id`, `tenant_id`, `actor_id`, `action`, `metadata`, `created_at` |

#### Staff Relations

- Staff mainly reads relations defined above; key is `tickets` linking to `orders` → `events`.
- `activity_logs.actor_id` ties every check-in or incident to the staff `user`.

### User Tables (Attendees)

| Table | Columns |
| --- | --- |
| `events` | public subset: `slug`, `name`, `description`, `venue`, `start_at`, `end_at`, `status`, `hero_image_url` |
| `event_sessions` | optional schedule details |
| `ticket_types` | `name`, `price_cents`, `currency`, `sales_start`, `sales_end`, `status`, `quantity_total`, `quantity_sold` |
| `orders` | `id`, `tenant_id`, `event_id`, `buyer_email`, `buyer_name`, `total_cents`, `status`, `public_lookup_token` |
| `order_items` | `ticket_type_id`, `quantity`, `unit_price_cents`, `subtotal_cents` |
| `tickets` | `id`, `order_id`, `ticket_type_id`, `attendee_name`, `qr_code_payload`, `status` |
| `discount_codes` | `code`, `discount_type`, `discount_value`, `expires_at`, `status` |
| `payments` | `provider_reference`, `status`, `amount_cents`, `currency` (displayed via order history) |

#### User Relations

- Users mainly read the same relationships: events → ticket_types, orders → order_items → tickets.
- `orders.buyer_email` ties attendee to their purchases for self-service portals.

## Feature Plan

1. **Foundation**
   - Connect NestJS to PostgreSQL via TypeORM with migrations.
   - Build auth (JWT + bcrypt) plus tenant context guards.
   - Seed an initial admin and sample tenant.
2. **Events and Tickets**
   - CRUD flows for events, sessions, ticket tiers.
   - Validation pipes to enforce unique slugs per tenant and safe inventory updates.
   - Organizer dashboards with basic stats.
3. **Checkout & Orders**
   - Create orders and order items, reserve inventory, integrate Stripe.
   - Store payment intents and webhook payloads with idempotent updates.
4. **Tickets & Check-In**
   - Generate QR codes per ticket, store signed payloads, expose staff check-in APIs.
   - Support manual lookup fallback and offline-friendly responses.
5. **Communications & Reporting**
   - Mailer for confirmations, staff invites, reminders.
   - CSV exports for orders and attendees, plus activity logging.
6. **Future Enhancements**
   - Discount automation, reserved seating, payout tracking, analytics.

## Role Highlights

- **admin**: approve tenants, configure global settings, watch webhooks, enforce security.
- **TenantAdmin**: manage branding, events, tickets, discounts, team invites, analytics, and refunds.
- **Staff**: run the check-in app, update attendance, assist attendees, submit incident notes.
- **User**: discover events, purchase tickets, download QR passes, manage notifications.

## Security, Validation, and Tooling

- JWT auth with guards, tenant interceptors, and per-role policies.
- Pipes enforce email/password standards, slug uniqueness, inventory caps, and webhook signature verification.
- Use ConfigModule for secrets, TypeORM migrations, and seed scripts.
- Automated tests (unit + e2e) plus structured logging for orders, check-ins, and webhooks.
