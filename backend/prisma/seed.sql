-- ============================================================
--  SaaSquatch Leads — PostgreSQL Seed File
--  Run this file against your PostgreSQL database to create
--  the schema and populate it with 25 realistic dummy leads.
--
--  Usage:
--    psql -U <username> -d <database_name> -f seed.sql
--  Or via connection string:
--    psql "postgresql://user:password@host:5432/dbname" -f seed.sql
-- ============================================================


-- ─────────────────────────────────────────
-- 1. CREATE TABLE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id                SERIAL PRIMARY KEY,
  company_name      VARCHAR(255)   NOT NULL,
  industry          VARCHAR(100)   NOT NULL,
  location          VARCHAR(150)   NOT NULL,
  website           VARCHAR(255),
  phone             VARCHAR(50),
  email             VARCHAR(255),
  owner_name        VARCHAR(150),
  employee_count    INTEGER,
  estimated_revenue NUMERIC(15, 2),
  linkedin_url      VARCHAR(255),
  score             NUMERIC(5, 2),
  score_tier        VARCHAR(20),
  score_rationale   TEXT,
  scraped_at        TIMESTAMPTZ    DEFAULT NOW(),
  source            VARCHAR(100),
  is_enriched       BOOLEAN        DEFAULT FALSE,
  pipeline_stage    VARCHAR(50)    DEFAULT 'Prospect'
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_industry        ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_company_name    ON leads(company_name);
CREATE INDEX IF NOT EXISTS idx_leads_score           ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage  ON leads(pipeline_stage);


-- ─────────────────────────────────────────
-- 2. CLEAR EXISTING SEED DATA (idempotent)
-- ─────────────────────────────────────────

TRUNCATE TABLE leads RESTART IDENTITY;


-- ─────────────────────────────────────────
-- 3. INSERT 25 DUMMY LEADS
-- ─────────────────────────────────────────

INSERT INTO leads (
  company_name, industry, location, website, phone, email,
  owner_name, employee_count, estimated_revenue, linkedin_url,
  score, score_tier, score_rationale,
  source, is_enriched, pipeline_stage, scraped_at
) VALUES

-- 1
('Arctic Comfort Systems',
 'HVAC', 'Houston, TX',
 'https://www.arcticcomfortsystems.com', '(713) 482-9034', 'info@arcticcomfortsystems.com',
 'James Carter', 85, 3200000.00, 'https://linkedin.com/company/arcticcomfortsystems',
 87.50, 'Hot', 'Enterprise size (+30), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Meeting Set', NOW() - INTERVAL '2 days'),

-- 2
('NexGen IT Solutions',
 'IT Services', 'Austin, TX',
 'https://www.nexgenit.com', '(512) 334-7821', 'contact@nexgenit.com',
 'Sarah Johnson', 120, 5800000.00, 'https://linkedin.com/company/nexgenit',
 92.00, 'Hot', 'Enterprise size (+30), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '1 day'),

-- 3
('GreenScape Designs',
 'Landscaping', 'Seattle, WA',
 'https://www.greenscapedesigns.com', '(206) 871-4453', 'hello@greenscapedesigns.com',
 'Emily Rodriguez', 22, 780000.00, 'https://linkedin.com/company/greenscapedesigns',
 54.00, 'Warm', 'Small business size (+10), Low-mid revenue (+10), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Contacted', NOW() - INTERVAL '3 days'),

-- 4
('BrightSmile Dental',
 'Dental Practices', 'Miami, FL',
 'https://www.brightsmilemiami.com', '(305) 920-6611', 'appointments@brightsmilemiami.com',
 'Dr. Amanda White', 18, 1200000.00, 'https://linkedin.com/company/brightsmilemiami',
 61.50, 'Warm', 'Small business size (+10), Medium revenue (+20), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Contacted', NOW() - INTERVAL '4 days'),

-- 5
('IronForge Construction',
 'Construction', 'Chicago, IL',
 'https://www.ironforgeconstruction.com', '(312) 744-8823', 'bid@ironforgeconstruction.com',
 'Robert Smith', 200, 12000000.00, 'https://linkedin.com/company/ironforgeconstruction',
 95.00, 'Hot', 'Enterprise size (+30), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Meeting Set', NOW() - INTERVAL '5 days'),

-- 6
('AquaFlow Plumbing',
 'Plumbing', 'Phoenix, AZ',
 'https://www.aquaflowplumbing.com', '(602) 555-3312', 'service@aquaflowplumbing.com',
 'Chris Davis', 12, 450000.00, 'https://linkedin.com/company/aquaflowplumbing',
 43.00, 'Warm', 'Small business size (+10), Low-mid revenue (+10), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', FALSE, 'Prospect', NOW() - INTERVAL '2 days'),

-- 7
('Summit Financial Group',
 'Accounting', 'New York, NY',
 'https://www.summitfinancialgroup.com', '(212) 880-4400', 'info@summitfinancialgroup.com',
 'Jessica Moore', 75, 4500000.00, 'https://linkedin.com/company/summitfinancialgroup',
 83.00, 'Hot', 'Mid-market size (+20), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Closed Won', NOW() - INTERVAL '10 days'),

-- 8
('BrandSpark Agency',
 'Marketing', 'Los Angeles, CA',
 'https://www.brandspark.agency', '(310) 666-7890', 'pitch@brandspark.agency',
 'Nicole Harris', 35, 2100000.00, 'https://linkedin.com/company/brandspark',
 72.00, 'Warm', 'Small business size (+10), Medium revenue (+20), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '1 day'),

-- 9
('FastLane Auto Repair',
 'Auto Repair', 'Dallas, TX',
 'https://www.fastlaneauto.com', '(214) 532-0099', 'service@fastlaneauto.com',
 'Daniel Clark', 8, 310000.00, 'https://linkedin.com/company/fastlaneauto',
 38.00, 'Cold', 'Micro business (+5), Low revenue (+5), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', FALSE, 'Prospect', NOW() - INTERVAL '6 days'),

-- 10
('PrimeNest Realty',
 'Real Estate', 'Denver, CO',
 'https://www.primenest.com', '(720) 401-5523', 'listings@primenest.com',
 'Amanda Taylor', 55, 3800000.00, 'https://linkedin.com/company/primenest',
 79.50, 'Warm', 'Mid-market size (+20), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Contacted', NOW() - INTERVAL '3 days'),

-- 11
('CloudBridge Technologies',
 'IT Services', 'San Francisco, CA',
 'https://www.cloudbridgetech.com', '(415) 820-3344', 'hello@cloudbridgetech.com',
 'Michael Lee', 160, 9200000.00, 'https://linkedin.com/company/cloudbridgetech',
 93.50, 'Hot', 'Enterprise size (+30), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Closed Won', NOW() - INTERVAL '14 days'),

-- 12
('ThermoTech Climate Control',
 'HVAC', 'Atlanta, GA',
 'https://www.thermotechclimate.com', '(404) 712-6630', 'service@thermotechclimate.com',
 'Brian Wilson', 30, 1050000.00, 'https://linkedin.com/company/thermotechclimate',
 57.00, 'Warm', 'Small business size (+10), Medium revenue (+20), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Meeting Set', NOW() - INTERVAL '7 days'),

-- 13
('PipeMaster Services',
 'Plumbing', 'Boston, MA',
 'https://www.pipemasterservices.com', '(617) 543-8812', 'info@pipemasterservices.com',
 'Rachel Brown', 14, 520000.00, 'https://linkedin.com/company/pipemasterservices',
 46.00, 'Warm', 'Small business size (+10), Low-mid revenue (+10), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '2 days'),

-- 14
('ClearBooks Accounting',
 'Accounting', 'Nashville, TN',
 'https://www.clearbooksaccounting.com', '(615) 330-5510', 'clients@clearbooksaccounting.com',
 'Kevin Martinez', 10, 390000.00, 'https://linkedin.com/company/clearbooksaccounting',
 40.50, 'Cold', 'Small business size (+10), Low revenue (+5), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', FALSE, 'Contacted', NOW() - INTERVAL '5 days'),

-- 15
('GrowthEngine Digital',
 'Marketing', 'Portland, OR',
 'https://www.growthengine.digital', '(503) 445-7723', 'team@growthengine.digital',
 'Lisa Thompson', 42, 2700000.00, 'https://linkedin.com/company/growthengine',
 74.00, 'Warm', 'Small business size (+10), Medium revenue (+20), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '1 day'),

-- 16
('SolidBuild Contractors',
 'Construction', 'Charlotte, NC',
 'https://www.solidbuildcontractors.com', '(704) 882-0043', 'bids@solidbuildcontractors.com',
 'David Anderson', 180, 8700000.00, 'https://linkedin.com/company/solidbuildcontractors',
 91.00, 'Hot', 'Enterprise size (+30), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Meeting Set', NOW() - INTERVAL '9 days'),

-- 17
('EverGreen Outdoor Services',
 'Landscaping', 'San Diego, CA',
 'https://www.evergreenoutdoor.com', '(619) 234-5561', 'hello@evergreenoutdoor.com',
 'Ashley Garcia', 17, 640000.00, 'https://linkedin.com/company/evergreenoutdoor',
 50.00, 'Warm', 'Small business size (+10), Low-mid revenue (+10), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Closed Lost', NOW() - INTERVAL '20 days'),

-- 18
('DataPulse Technologies',
 'IT Services', 'Minneapolis, MN',
 'https://www.datapulse.io', '(612) 788-2234', 'contact@datapulse.io',
 'John Walker', 95, 6100000.00, 'https://linkedin.com/company/datapulse',
 88.50, 'Hot', 'Mid-market size (+20), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '3 days'),

-- 19
('SmileWorks Family Dental',
 'Dental Practices', 'Austin, TX',
 'https://www.smileworksaustin.com', '(512) 667-3390', 'care@smileworksaustin.com',
 'Maria Lewis', 9, 480000.00, 'https://linkedin.com/company/smileworksaustin',
 37.00, 'Cold', 'Micro business (+5), Low-mid revenue (+10), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', FALSE, 'Prospect', NOW() - INTERVAL '4 days'),

-- 20
('SkyView Properties',
 'Real Estate', 'Miami, FL',
 'https://www.skyviewproperties.com', '(305) 544-9901', 'sales@skyviewproperties.com',
 'James Robinson', 68, 4200000.00, 'https://linkedin.com/company/skyviewproperties',
 82.00, 'Hot', 'Mid-market size (+20), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Contacted', NOW() - INTERVAL '6 days'),

-- 21
('PixelPeak Marketing',
 'Marketing', 'New York, NY',
 'https://www.pixelpeak.agency', '(212) 990-1145', 'projects@pixelpeak.agency',
 'Rachel Young', 28, 1600000.00, 'https://linkedin.com/company/pixelpeak',
 65.50, 'Warm', 'Small business size (+10), Medium revenue (+20), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Meeting Set', NOW() - INTERVAL '8 days'),

-- 22
('AllSeason Heating & Cooling',
 'HVAC', 'Chicago, IL',
 'https://www.allseasonhvac.com', '(312) 330-7765', 'service@allseasonhvac.com',
 'Chris Taylor', 45, 2400000.00, 'https://linkedin.com/company/allseasonhvac',
 76.00, 'Warm', 'Small business size (+10), Medium revenue (+20), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '2 days'),

-- 23
('TurboFix Automotive',
 'Auto Repair', 'Houston, TX',
 'https://www.turbofixauto.com', '(713) 612-0287', 'shop@turbofixauto.com',
 'Daniel Hall', 20, 870000.00, 'https://linkedin.com/company/turbofixauto',
 55.00, 'Warm', 'Small business size (+10), Low-mid revenue (+10), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Contacted', NOW() - INTERVAL '7 days'),

-- 24
('FiscalEdge Advisors',
 'Accounting', 'Denver, CO',
 'https://www.fiscaledgeadvisors.com', '(720) 554-3378', 'advisory@fiscaledgeadvisors.com',
 'Karen Lewis', 60, 3500000.00, 'https://linkedin.com/company/fiscaledgeadvisors',
 80.50, 'Hot', 'Mid-market size (+20), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Closed Won', NOW() - INTERVAL '15 days'),

-- 25
('KeyStone Property Group',
 'Real Estate', 'Dallas, TX',
 'https://www.keystoneproperty.com', '(214) 778-4456', 'info@keystoneproperty.com',
 'Brian Scott', 110, 7300000.00, 'https://linkedin.com/company/keystoneproperty',
 90.00, 'Hot', 'Enterprise size (+30), High revenue (+30), Data enriched (+15), Has LinkedIn profile (+10), Contact person identified (+10), Has website (+5)',
 'SaaSquatch Lead Engine', TRUE, 'Prospect', NOW() - INTERVAL '1 day');


-- ─────────────────────────────────────────
-- 4. VERIFY
-- ─────────────────────────────────────────

SELECT
  COUNT(*)                                          AS total_leads,
  COUNT(*) FILTER (WHERE score_tier = 'Hot')        AS hot_leads,
  COUNT(*) FILTER (WHERE score_tier = 'Warm')       AS warm_leads,
  COUNT(*) FILTER (WHERE score_tier = 'Cold')       AS cold_leads,
  ROUND(AVG(score), 2)                              AS avg_score,
  ROUND(SUM(estimated_revenue) / 1000000.0, 2)     AS total_revenue_millions
FROM leads;
