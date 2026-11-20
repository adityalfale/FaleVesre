-- AQUASENSE AI: PostgreSQL Database Schema
-- Production Ready Migration for Supabase / PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'society_admin', 'water_authority', 'super_admin')),
    phone VARCHAR(50),
    community_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. COMMUNITIES & LOCATIONS
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    total_households INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('borewell', 'water_tank', 'rainwater_harvesting', 'leakage', 'monitoring_station')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOREWELLS & GROUNDWATER READINGS
CREATE TABLE IF NOT EXISTS borewells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    total_depth_meters DOUBLE PRECISION NOT NULL,
    casing_depth_meters DOUBLE PRECISION,
    pump_installed_depth_meters DOUBLE PRECISION,
    pump_power_hp DOUBLE PRECISION,
    pump_flow_rate_lpm DOUBLE PRECISION DEFAULT 60.0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'depleted', 'inactive')),
    installation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groundwater_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borewell_id UUID REFERENCES borewells(id) ON DELETE CASCADE,
    depth_to_water_meters DOUBLE PRECISION NOT NULL,
    water_column_meters DOUBLE PRECISION NOT NULL,
    temperature_celsius DOUBLE PRECISION,
    source VARCHAR(50) DEFAULT 'sensor' CHECK (source IN ('sensor', 'manual_verified', 'community_unverified', 'ai_estimate')),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT
);

-- 4. SENSORS & SENSOR EVENTS (IoT)
CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_uid VARCHAR(100) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('ultrasonic_depth', 'flow_meter', 'pressure_transducer', 'rain_gauge', 'water_quality')),
    borewell_id UUID REFERENCES borewells(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    hardware_model VARCHAR(100) DEFAULT 'ESP32-AquaSense-v2',
    firmware_version VARCHAR(50) DEFAULT '2.4.1',
    connection_protocol VARCHAR(50) DEFAULT 'wifi_http' CHECK (connection_protocol IN ('wifi_http', 'mqtt', 'lorawan', 'cellular')),
    api_token VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning', 'maintenance')),
    battery_percentage INTEGER DEFAULT 100,
    signal_strength_rssi INTEGER DEFAULT -65,
    last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    raw_reading JSONB NOT NULL,
    reading_value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. WATER TANKS & READINGS
CREATE TABLE IF NOT EXISTS water_tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tank_type VARCHAR(50) DEFAULT 'overhead' CHECK (tank_type IN ('overhead', 'underground_sump', 'ground_level')),
    capacity_liters DOUBLE PRECISION NOT NULL,
    height_meters DOUBLE PRECISION NOT NULL,
    current_level_liters DOUBLE PRECISION NOT NULL,
    current_percentage DOUBLE PRECISION NOT NULL,
    sensor_id UUID REFERENCES sensors(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'optimal' CHECK (status IN ('optimal', 'moderate', 'low', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tank_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id UUID REFERENCES water_tanks(id) ON DELETE CASCADE,
    water_level_liters DOUBLE PRECISION NOT NULL,
    percentage DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. WATER CONSUMPTION
CREATE TABLE IF NOT EXISTS water_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    liters_consumed DOUBLE PRECISION NOT NULL,
    consumption_type VARCHAR(50) DEFAULT 'domestic' CHECK (consumption_type IN ('domestic', 'gardening', 'commercial', 'loss')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TANKER SCHEDULES & DELIVERIES
CREATE TABLE IF NOT EXISTS tanker_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(50),
    vehicle_number VARCHAR(50) NOT NULL,
    capacity_liters DOUBLE PRECISION NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'arrived', 'delayed', 'completed', 'cancelled')),
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    target_tank_id UUID REFERENCES water_tanks(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tanker_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES tanker_schedules(id) ON DELETE CASCADE,
    volume_delivered_liters DOUBLE PRECISION NOT NULL,
    water_quality_grade VARCHAR(20) DEFAULT 'A',
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. RAINFALL & HARVESTING
CREATE TABLE IF NOT EXISTS rainfall_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    rainfall_mm DOUBLE PRECISION NOT NULL,
    recorded_date DATE NOT NULL,
    duration_hours DOUBLE PRECISION DEFAULT 1.0,
    source VARCHAR(50) DEFAULT 'rain_gauge' CHECK (source IN ('rain_gauge', 'imd_weather_api', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvesting_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    building_name VARCHAR(255) NOT NULL,
    catchment_area_sqm DOUBLE PRECISION NOT NULL,
    harvesting_method VARCHAR(100) NOT NULL CHECK (harvesting_method IN ('rooftop_storage', 'groundwater_recharge_pit', 'filtration_well', 'hybrid')),
    storage_capacity_liters DOUBLE PRECISION NOT NULL,
    runoff_coefficient DOUBLE PRECISION DEFAULT 0.85,
    installation_date DATE,
    filter_type VARCHAR(100) DEFAULT 'Sand and gravel dual-media filter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvesting_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    harvesting_unit_id UUID REFERENCES harvesting_units(id) ON DELETE CASCADE,
    checklist_rooftop_clean BOOLEAN DEFAULT false,
    checklist_filter_inspected BOOLEAN DEFAULT false,
    checklist_downpipes_checked BOOLEAN DEFAULT false,
    checklist_storage_cleaned BOOLEAN DEFAULT false,
    checklist_recharge_cleared BOOLEAN DEFAULT false,
    checklist_overflow_tested BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    inspected_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    maintenance_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. LEAKAGE REPORTS & COMMUNITY LOGS
CREATE TABLE IF NOT EXISTS leakage_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reporter_name VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    leakage_type VARCHAR(50) NOT NULL CHECK (leakage_type IN ('pipe_burst', 'overhead_tank_overflow', 'valve_leak', 'meter_leak', 'ground_seepage', 'faucet_drip')),
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_description TEXT,
    photo_url TEXT,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
    estimated_water_loss_liters DOUBLE PRECISION DEFAULT 0,
    assigned_to VARCHAR(100),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('water_availability', 'shortage_alert', 'tanker_arrival', 'manual_measurement', 'conservation_observation')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metric_value DOUBLE PRECISION,
    metric_unit VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ALERTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('groundwater', 'tank_level', 'consumption', 'leakage', 'device_offline', 'tanker', 'rainwater')),
    is_read BOOLEAN DEFAULT false,
    source_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AI PREDICTIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('groundwater_depth', 'demand_forecast', 'shortage_risk', 'anomaly_score')),
    forecast_horizon_days INTEGER NOT NULL,
    predicted_values JSONB NOT NULL,
    confidence_lower JSONB,
    confidence_upper JSONB,
    accuracy_metrics JSONB,
    training_data_points INTEGER,
    data_freshness_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_groundwater_borewell ON groundwater_readings(borewell_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_tank_readings_tank ON tank_readings(tank_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_consumption_date ON water_consumption(community_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(community_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leakage_status ON leakage_reports(community_id, status);
CREATE INDEX IF NOT EXISTS idx_sensors_device_uid ON sensors(device_uid);

