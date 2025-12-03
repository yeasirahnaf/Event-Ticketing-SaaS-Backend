-- ============================================================================
-- EVENT TICKETING SYSTEM - COMPLETE DATABASE SEED FILE
-- ============================================================================
-- This file creates test users and feeds dummy data for testing
-- Password for all users: Password@123
-- ============================================================================

-- Clear existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE activity_logs, webhook_events, payments, tickets, order_items, orders, discount_codes, ticket_types, event_sessions, events, staff, tenant_users, tenants, users CASCADE;

-- ============================================================================
-- 1. USERS (Platform Users)
-- ============================================================================
-- Password hashes:
-- Admin@123: $2b$10$f9DPIIp2n.jKFToES3EALeds3yVewJgm9EbTpoIo2aXeXXdAxCxg6
-- Password@123: $2b$10$MZKl4w0Wt2CoJq14kgzpmeyoa9ZV/VlfeqFqurahxy5dq27OJHQ8a

INSERT INTO users (id, email, password_hash, full_name, is_platform_admin, created_at, updated_at) VALUES
-- Platform Admin (Password: Admin@123)
('a0000000-0000-0000-0000-000000000001', 'admin@platform.com', '$2b$10$f9DPIIp2n.jKFToES3EALeds3yVewJgm9EbTpoIo2aXeXXdAxCxg6', 'Platform Admin', true, NOW(), NOW()),

-- Tenant Admin Users (Password: Password@123)
('a0000000-0000-0000-0000-000000000002', 'tenantadmin1@example.com', '$2b$10$MZKl4w0Wt2CoJq14kgzpmeyoa9ZV/VlfeqFqurahxy5dq27OJHQ8a', 'Tenant Admin One', false, NOW(), NOW()),
('a0000000-0000-0000-0000-000000000003', 'tenantadmin2@example.com', '$2b$10$MZKl4w0Wt2CoJq14kgzpmeyoa9ZV/VlfeqFqurahxy5dq27OJHQ8a', 'Tenant Admin Two', false, NOW(), NOW()),

-- Staff Users (Password: Password@123)
('a0000000-0000-0000-0000-000000000004', 'staff1@example.com', '$2b$10$MZKl4w0Wt2CoJq14kgzpmeyoa9ZV/VlfeqFqurahxy5dq27OJHQ8a', 'Staff Member One', false, NOW(), NOW()),
('a0000000-0000-0000-0000-000000000005', 'staff2@example.com', '$2b$10$MZKl4w0Wt2CoJq14kgzpmeyoa9ZV/VlfeqFqurahxy5dq27OJHQ8a', 'Staff Member Two', false, NOW(), NOW()),
('a0000000-0000-0000-0000-000000000006', 'staff3@example.com', '$2b$10$MZKl4w0Wt2CoJq14kgzpmeyoa9ZV/VlfeqFqurahxy5dq27OJHQ8a', 'Staff Member Three', false, NOW(), NOW());

-- ============================================================================
-- 2. TENANTS (Event Organizers)
-- ============================================================================

INSERT INTO tenants (id, name, slug, branding_settings, status, created_at, updated_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'Dhaka Events Co.', 'dhaka-events', 
 '{"logo": "https://example.com/logos/dhaka-events.png", "primaryColor": "#FF5733", "secondaryColor": "#33C3F0"}', 
 'active', NOW(), NOW()),
('b0000000-0000-0000-0000-000000000002', 'Chittagong Music Festival', 'chittagong-music', 
 '{"logo": "https://example.com/logos/chittagong-music.png", "primaryColor": "#9B59B6", "secondaryColor": "#E74C3C"}', 
 'active', NOW(), NOW());

-- ============================================================================
-- 3. TENANT_USERS (Link Users to Tenants)
-- ============================================================================

INSERT INTO tenant_users (id, tenant_id, user_id, role, status, invited_at, created_at) VALUES
-- Tenant 1: TenantAdmin and Staff
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'TenantAdmin', 'active', NOW(), NOW()),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'staff', 'active', NOW(), NOW()),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'staff', 'active', NOW(), NOW()),

-- Tenant 2: TenantAdmin and Staff
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'TenantAdmin', 'active', NOW(), NOW()),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'staff', 'active', NOW(), NOW());

-- ============================================================================
-- 4. STAFF (Staff Entity Records)
-- ============================================================================

INSERT INTO staff (id, tenant_id, user_id, "fullName", position, "phoneNumber", gender, is_active, created_at, updated_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Staff Member One', 'CHECKER', '+8801712345678', 'MALE', true, NOW(), NOW()),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'Staff Member Two', 'SUPERVISOR', '+8801712345679', 'FEMALE', true, NOW(), NOW()),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'Staff Member Three', 'CHECKER', '+8801712345680', 'MALE', true, NOW(), NOW());

-- ============================================================================
-- 5. EVENTS
-- ============================================================================

INSERT INTO events (id, tenant_id, name, slug, description, venue, city, country, start_at, end_at, status, is_public, hero_image_url, seo_meta, created_at, updated_at) VALUES
-- Event 1: Active Public Event
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 
 'Summer Music Festival 2024', 'summer-music-festival-2024',
 'Join us for an amazing summer music festival featuring top artists from Bangladesh and around the world. Experience live performances, food stalls, and great vibes!',
 'Bangabandhu National Stadium', 'Dhaka', 'Bangladesh',
 '2024-07-15 18:00:00+06:00', '2024-07-15 23:00:00+06:00',
 'active', true,
 'https://example.com/images/summer-festival-hero.jpg',
 '{"title": "Summer Music Festival 2024 - Dhaka", "description": "Join us for an amazing music festival", "keywords": ["music", "festival", "dhaka", "bangladesh"]}',
 NOW(), NOW()),

-- Event 2: Scheduled Public Event
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
 'Tech Conference BD 2024', 'tech-conference-bd-2024',
 'Annual technology conference featuring talks on AI, blockchain, and software development. Network with industry leaders and developers.',
 'International Convention City Bashundhara', 'Dhaka', 'Bangladesh',
 '2024-08-20 09:00:00+06:00', '2024-08-20 18:00:00+06:00',
 'scheduled', true,
 'https://example.com/images/tech-conference-hero.jpg',
 '{"title": "Tech Conference BD 2024", "description": "Annual technology conference", "keywords": ["tech", "conference", "dhaka"]}',
 NOW(), NOW()),

-- Event 3: Active Public Event (Tenant 2)
('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
 'Chittagong Food Festival', 'chittagong-food-festival',
 'Taste the best of Chittagong cuisine! Local restaurants and food vendors showcasing traditional and modern dishes.',
 'Port City Park', 'Chittagong', 'Bangladesh',
 '2024-09-10 16:00:00+06:00', '2024-09-10 22:00:00+06:00',
 'active', true,
 'https://example.com/images/food-festival-hero.jpg',
 '{"title": "Chittagong Food Festival 2024", "description": "Taste the best of Chittagong", "keywords": ["food", "festival", "chittagong"]}',
 NOW(), NOW()),

-- Event 4: Draft Event (Not Public)
('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001',
 'Winter Concert 2024', 'winter-concert-2024',
 'Upcoming winter concert - details coming soon!',
 'Army Stadium', 'Dhaka', 'Bangladesh',
 '2024-12-20 19:00:00+06:00', '2024-12-20 23:00:00+06:00',
 'draft', false,
 NULL,
 NULL,
 NOW(), NOW());

-- ============================================================================
-- 6. EVENT_SESSIONS
-- ============================================================================

INSERT INTO event_sessions (id, event_id, title, description, start_at, end_at, created_at, updated_at) VALUES
-- Sessions for Event 1
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'Opening Ceremony', 'Festival opening with welcome speeches and first performance',
 '2024-07-15 18:00:00+06:00', '2024-07-15 19:00:00+06:00', NOW(), NOW()),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'Main Concert', 'Main artist performances',
 '2024-07-15 19:30:00+06:00', '2024-07-15 22:00:00+06:00', NOW(), NOW()),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001',
 'Closing Ceremony', 'Final performances and closing remarks',
 '2024-07-15 22:00:00+06:00', '2024-07-15 23:00:00+06:00', NOW(), NOW()),

-- Sessions for Event 2
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002',
 'Morning Keynote', 'Opening keynote on AI and Future of Technology',
 '2024-08-20 09:00:00+06:00', '2024-08-20 10:30:00+06:00', NOW(), NOW()),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002',
 'Workshop Sessions', 'Hands-on workshops on various tech topics',
 '2024-08-20 11:00:00+06:00', '2024-08-20 13:00:00+06:00', NOW(), NOW()),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002',
 'Panel Discussion', 'Expert panel on software development trends',
 '2024-08-20 14:00:00+06:00', '2024-08-20 16:00:00+06:00', NOW(), NOW()),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000002',
 'Networking Session', 'Networking and closing',
 '2024-08-20 16:00:00+06:00', '2024-08-20 18:00:00+06:00', NOW(), NOW());

-- ============================================================================
-- 7. TICKET_TYPES
-- ============================================================================

INSERT INTO ticket_types (id, event_id, name, description, price_taka, currency, quantity_total, quantity_sold, sales_start, sales_end, status, created_at, updated_at) VALUES
-- Ticket Types for Event 1
('10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'VIP Ticket', 'VIP access with premium seating and backstage access', 5000, 'BDT', 100, 15,
 '2024-06-01 00:00:00+06:00', '2024-07-14 23:59:59+06:00', 'active', NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'General Admission', 'Standard entry ticket', 2000, 'BDT', 500, 120,
 '2024-06-01 00:00:00+06:00', '2024-07-14 23:59:59+06:00', 'active', NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001',
 'Early Bird', 'Early bird discount ticket', 1500, 'BDT', 200, 200,
 '2024-05-01 00:00:00+06:00', '2024-05-31 23:59:59+06:00', 'sold_out', NOW(), NOW()),

-- Ticket Types for Event 2
('10000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002',
 'Full Day Pass', 'Access to all sessions and workshops', 3000, 'BDT', 300, 45,
 '2024-07-01 00:00:00+06:00', '2024-08-19 23:59:59+06:00', 'active', NOW(), NOW()),
('10000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002',
 'Half Day Pass', 'Access to morning or afternoon sessions', 1500, 'BDT', 200, 30,
 '2024-07-01 00:00:00+06:00', '2024-08-19 23:59:59+06:00', 'active', NOW(), NOW()),

-- Ticket Types for Event 3
('10000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003',
 'Food Lover Pass', 'Unlimited food tasting from all vendors', 1000, 'BDT', 500, 80,
 '2024-08-01 00:00:00+06:00', '2024-09-09 23:59:59+06:00', 'active', NOW(), NOW()),
('10000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003',
 'Standard Entry', 'Entry ticket with food vouchers', 500, 'BDT', 1000, 200,
 '2024-08-01 00:00:00+06:00', '2024-09-09 23:59:59+06:00', 'active', NOW(), NOW());

-- ============================================================================
-- 8. DISCOUNT_CODES
-- ============================================================================

INSERT INTO discount_codes (id, event_id, code, description, max_redemptions, times_redeemed, discount_type, discount_value, starts_at, expires_at, status, created_at, updated_at) VALUES
-- Discount Codes for Event 1
('20000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'SUMMER2024', 'Summer festival discount - 20% off', 50, 12, 'percentage', 20,
 '2024-06-01 00:00:00+06:00', '2024-07-14 23:59:59+06:00', 'active', NOW(), NOW()),
('20000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
 'EARLY50', 'Early bird flat discount - 500 Taka off', 100, 25, 'fixed_amount', 500,
 '2024-05-15 00:00:00+06:00', '2024-06-30 23:59:59+06:00', 'active', NOW(), NOW()),

-- Discount Codes for Event 2
('20000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002',
 'TECH2024', 'Tech conference discount - 15% off', 30, 8, 'percentage', 15,
 '2024-07-15 00:00:00+06:00', '2024-08-19 23:59:59+06:00', 'active', NOW(), NOW()),

-- Discount Codes for Event 3
('20000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000003',
 'FOODIE', 'Food festival discount - 100 Taka off', 200, 45, 'fixed_amount', 100,
 '2024-08-15 00:00:00+06:00', '2024-09-09 23:59:59+06:00', 'active', NOW(), NOW());

-- ============================================================================
-- 9. ORDERS
-- ============================================================================

INSERT INTO orders (id, tenant_id, event_id, buyer_email, buyer_name, total_taka, currency, status, payment_intent_id, public_lookup_token, created_at, updated_at) VALUES
-- Orders for Event 1
('30000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'buyer1@example.com', 'John Buyer', 10000, 'BDT', 'completed', 'pi_stripe_123456', 'lookup_token_001', NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'buyer2@example.com', 'Sarah Buyer', 4000, 'BDT', 'completed', 'pi_bkash_789012', 'lookup_token_002', NOW(), NOW()),
('30000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'buyer3@example.com', 'Ahmed Buyer', 5000, 'BDT', 'pending', NULL, 'lookup_token_003', NOW(), NOW()),

-- Orders for Event 2
('30000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002',
 'buyer4@example.com', 'Fatima Buyer', 3000, 'BDT', 'completed', 'pi_nagad_345678', 'lookup_token_004', NOW(), NOW()),

-- Orders for Event 3
('30000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003',
 'buyer5@example.com', 'Rahman Buyer', 2000, 'BDT', 'completed', 'pi_rocket_901234', 'lookup_token_005', NOW(), NOW());

-- ============================================================================
-- 10. ORDER_ITEMS
-- ============================================================================

INSERT INTO order_items (id, order_id, ticket_type_id, unit_price_taka, quantity, subtotal_taka, created_at, updated_at) VALUES
-- Order Items for Order 1 (2 VIP tickets)
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 5000, 2, 10000, NOW(), NOW()),

-- Order Items for Order 2 (2 General Admission tickets)
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 2000, 2, 4000, NOW(), NOW()),

-- Order Items for Order 3 (1 VIP ticket)
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 5000, 1, 5000, NOW(), NOW()),

-- Order Items for Order 4 (1 Full Day Pass)
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 3000, 1, 3000, NOW(), NOW()),

-- Order Items for Order 5 (2 Food Lover Passes)
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', 1000, 2, 2000, NOW(), NOW());

-- ============================================================================
-- 11. TICKETS (with QR codes)
-- ============================================================================

INSERT INTO tickets (id, order_id, ticket_type_id, attendee_name, attendee_email, qr_code_payload, qr_signature, status, checked_in_at, seat_label, created_at, updated_at) VALUES
-- Tickets for Order 1 (2 VIP tickets)
('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
 'John Buyer', 'buyer1@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000001","orderId":"30000000-0000-0000-0000-000000000001","eventId":"e0000000-0000-0000-0000-000000000001","attendeeName":"John Buyer","timestamp":1720000000000}',
 'qr_signature_hash_001', 'valid', NULL, 'VIP-A-01', NOW(), NOW()),
('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
 'John Buyer', 'buyer1@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000002","orderId":"30000000-0000-0000-0000-000000000001","eventId":"e0000000-0000-0000-0000-000000000001","attendeeName":"John Buyer","timestamp":1720000000001}',
 'qr_signature_hash_002', 'valid', NULL, 'VIP-A-02', NOW(), NOW()),

-- Tickets for Order 2 (2 General Admission tickets)
('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
 'Sarah Buyer', 'buyer2@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000003","orderId":"30000000-0000-0000-0000-000000000002","eventId":"e0000000-0000-0000-0000-000000000001","attendeeName":"Sarah Buyer","timestamp":1720000000002}',
 'qr_signature_hash_003', 'scanned', '2024-07-15 18:30:00+06:00', 'GA-101', NOW(), NOW()),
('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
 'Sarah Buyer', 'buyer2@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000004","orderId":"30000000-0000-0000-0000-000000000002","eventId":"e0000000-0000-0000-0000-000000000001","attendeeName":"Sarah Buyer","timestamp":1720000000003}',
 'qr_signature_hash_004', 'valid', NULL, 'GA-102', NOW(), NOW()),

-- Tickets for Order 3 (1 VIP ticket - pending payment)
('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
 'Ahmed Buyer', 'buyer3@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000005","orderId":"30000000-0000-0000-0000-000000000003","eventId":"e0000000-0000-0000-0000-000000000001","attendeeName":"Ahmed Buyer","timestamp":1720000000004}',
 'qr_signature_hash_005', 'valid', NULL, 'VIP-B-01', NOW(), NOW()),

-- Tickets for Order 4 (1 Full Day Pass)
('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004',
 'Fatima Buyer', 'buyer4@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000006","orderId":"30000000-0000-0000-0000-000000000004","eventId":"e0000000-0000-0000-0000-000000000002","attendeeName":"Fatima Buyer","timestamp":1720000000005}',
 'qr_signature_hash_006', 'valid', NULL, NULL, NOW(), NOW()),

-- Tickets for Order 5 (2 Food Lover Passes)
('50000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006',
 'Rahman Buyer', 'buyer5@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000007","orderId":"30000000-0000-0000-0000-000000000005","eventId":"e0000000-0000-0000-0000-000000000003","attendeeName":"Rahman Buyer","timestamp":1720000000006}',
 'qr_signature_hash_007', 'valid', NULL, NULL, NOW(), NOW()),
('50000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006',
 'Rahman Buyer', 'buyer5@example.com',
 '{"ticketId":"50000000-0000-0000-0000-000000000008","orderId":"30000000-0000-0000-0000-000000000005","eventId":"e0000000-0000-0000-0000-000000000003","attendeeName":"Rahman Buyer","timestamp":1720000000007}',
 'qr_signature_hash_008', 'valid', NULL, NULL, NOW(), NOW());

-- ============================================================================
-- 12. PAYMENTS
-- ============================================================================

INSERT INTO payments (id, order_id, provider, provider_reference, status, amount_cents, currency, processed_at, payload, created_at) VALUES
-- Payments for completed orders
('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'stripe', 'ch_stripe_123456', 'completed', 1000000, 'BDT', NOW(),
 '{"payment_intent_id": "pi_stripe_123456", "transaction_id": "ch_stripe_123456", "amount": 10000, "currency": "BDT"}', NOW()),
('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'bkash', 'TRX_bkash_789012', 'completed', 400000, 'BDT', NOW(),
 '{"transaction_id": "TRX_bkash_789012", "amount": 4000, "currency": "BDT", "mobile_number": "+8801712345678"}', NOW()),
('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 'nagad', 'TRX_nagad_345678', 'completed', 300000, 'BDT', NOW(),
 '{"transaction_id": "TRX_nagad_345678", "amount": 3000, "currency": "BDT", "mobile_number": "+8801712345679"}', NOW()),
('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'rocket', 'TRX_rocket_901234', 'completed', 200000, 'BDT', NOW(),
 '{"transaction_id": "TRX_rocket_901234", "amount": 2000, "currency": "BDT", "account_number": "1234567890"}', NOW());

-- ============================================================================
-- 13. ACTIVITY_LOGS
-- ============================================================================

INSERT INTO activity_logs (id, tenant_id, actor_id, action, metadata, created_at) VALUES
-- Activity logs for Tenant 1
('70000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
 'event.created', '{"eventId": "e0000000-0000-0000-0000-000000000001", "eventName": "Summer Music Festival 2024"}', NOW()),
('70000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004',
 'ticket.checked_in', '{"ticketId": "50000000-0000-0000-0000-000000000003", "eventId": "e0000000-0000-0000-0000-000000000001", "description": "Checked in ticket for Sarah Buyer"}', NOW()),
('70000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
 'order.completed', '{"orderId": "i0000000-0000-0000-0000-000000000001", "totalAmount": 10000, "buyerEmail": "buyer1@example.com"}', NOW()),

-- Activity logs for Tenant 2
('70000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
 'event.created', '{"eventId": "e0000000-0000-0000-0000-000000000003", "eventName": "Chittagong Food Festival"}', NOW()),
('70000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003',
 'order.completed', '{"orderId": "i0000000-0000-0000-0000-000000000005", "totalAmount": 2000, "buyerEmail": "buyer5@example.com"}', NOW());

-- ============================================================================
-- 14. WEBHOOK_EVENTS
-- ============================================================================

INSERT INTO webhook_events (id, provider, event_type, payload, received_at, processed_at, status, error_message, created_at) VALUES
('80000000-0000-0000-0000-000000000001', 'stripe', 'payment.succeeded',
 '{"id": "evt_stripe_123", "type": "payment_intent.succeeded", "data": {"object": {"id": "pi_stripe_123456", "amount": 1000000}}}',
 NOW(), NOW(), 'processed', NULL, NOW()),
('80000000-0000-0000-0000-000000000002', 'bkash', 'payment.completed',
 '{"transaction_id": "TRX_bkash_789012", "amount": 4000, "status": "success"}',
 NOW(), NOW(), 'processed', NULL, NOW()),
('80000000-0000-0000-0000-000000000003', 'nagad', 'payment.completed',
 '{"transaction_id": "TRX_nagad_345678", "amount": 3000, "status": "success"}',
 NOW(), NULL, 'pending', NULL, NOW());

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created:
-- - 6 Users (1 platform admin, 2 tenant admins, 3 staff)
-- - 2 Tenants
-- - 5 Tenant-User relationships
-- - 3 Staff records
-- - 4 Events (3 active public, 1 draft)
-- - 7 Event Sessions
-- - 7 Ticket Types
-- - 4 Discount Codes
-- - 5 Orders
-- - 5 Order Items
-- - 8 Tickets (with QR codes)
-- - 4 Payments
-- - 5 Activity Logs
-- - 3 Webhook Events
--
-- Passwords:
-- - admin@platform.com: Admin@123
-- - All other users: Password@123
-- ============================================================================

