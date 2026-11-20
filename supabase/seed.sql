-- AQUASENSE AI: Sample Seed Data
-- Note: All sample values are labelled as SAMPLE DATA / VERIFIED INITIAL SET

-- 1. SEED PROFILES
INSERT INTO profiles (id, email, full_name, role, phone, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@aquasense.ai', 'Dr. Radhika Sharma (Hydrologist)', 'super_admin', '+91 98765 43210', NOW()),
('22222222-2222-2222-2222-222222222222', 'society.admin@greenvalleys.org', 'Suresh Menon (Society Secretary)', 'society_admin', '+91 98450 12345', NOW()),
('33333333-3333-3333-3333-333333333333', 'officer@waterauthority.gov.in', 'Vikram Patel (Jal Board Inspector)', 'water_authority', '+91 94480 67890', NOW()),
('44444444-4444-4444-4444-444444444444', 'resident.anita@gmail.com', 'Anita Desai (Tower B - 402)', 'resident', '+91 99123 45678', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. SEED COMMUNITIES
INSERT INTO communities (id, name, code, address, city, state, postal_code, latitude, longitude, total_households) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Green Valley Eco Enclave', 'GV-BLR-01', 'Survey 42, Varthur - Sarjapur Road', 'Bengaluru', 'Karnataka', '560087', 12.9352, 77.7298, 380),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sunrise Heights Cooperative', 'SH-PUN-02', 'Bavdhan Hills, West Pune', 'Pune', 'Maharashtra', '411021', 18.5158, 73.7819, 240),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Neelkanth Oasis Residential', 'NO-HYD-03', 'Financial District, Gachibowli', 'Hyderabad', 'Telangana', '500032', 17.4239, 78.3489, 520)
ON CONFLICT (id) DO NOTHING;

-- Update profile community association
UPDATE profiles SET community_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE email IN ('society.admin@greenvalleys.org', 'resident.anita@gmail.com');

-- 3. SEED LOCATIONS
INSERT INTO locations (id, community_id, name, location_type, latitude, longitude, altitude, description) VALUES
('loc-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Main Borewell #1 (North Gate Aquifer)', 'borewell', 12.9355, 77.7292, 892.5, 'Primary deep borewell equipped with digital sensor'),
('loc-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Secondary Borewell #2 (South Garden)', 'borewell', 12.9348, 77.7305, 891.2, 'Secondary recharge borewell near rainwater sump'),
('loc-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Central Overhead Tank Tower A', 'water_tank', 12.9354, 77.7299, 908.0, '150,000 Litres RCC Overhead Reservoir'),
('loc-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rainwater Harvesting Sump #1', 'rainwater_harvesting', 12.9351, 77.7302, 890.0, '200,000 Litres Underground rainwater storage pit'),
('loc-005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Reported Leakage - Block C Main Pipe', 'leakage', 12.9350, 77.7295, 891.8, 'Distribution pipe flange weeping')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BOREWELLS
INSERT INTO borewells (id, community_id, location_id, name, code, total_depth_meters, casing_depth_meters, pump_installed_depth_meters, pump_power_hp, pump_flow_rate_lpm, status, installation_date) VALUES
('bw-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'loc-001', 'North Borewell - Aquifer Deep BW-1', 'BW-GV-01', 185.0, 32.0, 150.0, 7.5, 75.0, 'active', '2021-03-15'),
('bw-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'loc-002', 'South Garden Recharge Borewell BW-2', 'BW-GV-02', 140.0, 28.0, 110.0, 5.0, 50.0, 'active', '2022-07-20'),
('bw-003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'Bavdhan Hill Borewell SH-1', 'BW-SH-01', 160.0, 30.0, 130.0, 6.0, 65.0, 'maintenance', '2020-11-10')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SENSORS
INSERT INTO sensors (id, device_uid, device_type, borewell_id, location_id, hardware_model, firmware_version, connection_protocol, api_token, status, battery_percentage, signal_strength_rssi) VALUES
('sens-001', 'ESP32-BW01-D9F4', 'pressure_transducer', 'bw-001', 'loc-001', 'ESP32-AquaSense-Pro', '2.4.1', 'wifi_http', 'sec_tok_bw01_9921ab', 'online', 98, -62),
('sens-002', 'ESP32-TANK-A102', 'ultrasonic_depth', NULL, 'loc-003', 'ESP32-AquaSense-Tank', '2.3.8', 'wifi_http', 'sec_tok_tnk01_7734cd', 'online', 94, -58),
('sens-003', 'ESP32-RAIN-R701', 'rain_gauge', NULL, 'loc-004', 'ESP32-AquaSense-Meteo', '1.9.0', 'lorawan', 'sec_tok_rain_4482ef', 'online', 88, -74)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED WATER TANKS
INSERT INTO water_tanks (id, community_id, name, tank_type, capacity_liters, height_meters, current_level_liters, current_percentage, sensor_id, status) VALUES
('tank-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tower A Overhead Tank', 'overhead', 150000.0, 4.5, 108000.0, 72.0, 'sens-002', 'optimal'),
('tank-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Underground Central Sump', 'underground_sump', 250000.0, 5.0, 185000.0, 74.0, NULL, 'optimal'),
('tank-003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sunrise Heights Main Reservoir', 'overhead', 100000.0, 4.0, 32000.0, 32.0, NULL, 'low')
ON CONFLICT (id) DO NOTHING;

