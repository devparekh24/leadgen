// Lead scraping service — generates realistic mock B2B company data.

const COMPANY_NAMES: Record<string, string[]> = {
  "HVAC": [
    "Arctic Comfort Systems", "SunBelt HVAC Solutions", "CoolBreeze Air Services",
    "ThermoTech Climate Control", "AllSeason Heating & Cooling", "Precision Air Pros",
    "FrostGuard HVAC", "AirFlow Masters", "ComfortZone Systems", "BlueFlame Heating"
  ],
  "Plumbing": [
    "AquaFlow Plumbing", "PipeMaster Services", "DrainPro Solutions",
    "ClearWater Plumbing Co", "RapidFlow Pipes", "LeakSeal Experts",
    "TrueBlue Plumbing", "FlowRight Services", "PipeWorks Pros", "AquaStar Plumbing"
  ],
  "IT Services": [
    "NexGen IT Solutions", "CloudBridge Technologies", "ByteShift Systems",
    "CyberForge IT", "DataPulse Technologies", "InfraTech Solutions",
    "StackPoint IT", "NetVault Consulting", "CodeCraft Systems", "DigitalOps Group"
  ],
  "Landscaping": [
    "GreenScape Designs", "TerraVista Landscaping", "EverGreen Outdoor Services",
    "NatureWorks Landscaping", "PrimeLawn Solutions", "StonePath Gardens",
    "GardenEdge Pros", "LeafLine Landscapes", "GreenThumb Outdoors", "LandCraft Services"
  ],
  "Dental Practices": [
    "BrightSmile Dental", "PearlCare Dentistry", "Apex Dental Group",
    "SmileWorks Family Dental", "CrystalClear Dental", "GentleCare Dentistry",
    "PrimeDent Associates", "SunRise Dental Clinic", "TrueSmile Dental", "OralHealth Partners"
  ],
  "Auto Repair": [
    "FastLane Auto Repair", "TurboFix Automotive", "PrecisionDrive Auto",
    "AllGear Mechanics", "SpeedWrench Auto Care", "MotorCraft Services",
    "AutoElite Repair", "QuickTune Garage", "DriveRight Auto", "GearShift Automotive"
  ],
  "Accounting": [
    "Summit Financial Group", "ClearBooks Accounting", "TrueBalance CPA",
    "PrecisionLedger Services", "FiscalEdge Advisors", "NumberCraft Accounting",
    "EliteBooks Financial", "TaxPro Solutions", "LedgerLine CPA", "SmartBooks Advisory"
  ],
  "Marketing": [
    "BrandSpark Agency", "PixelPeak Marketing", "GrowthEngine Digital",
    "ViralReach Media", "CampaignForge Inc", "ClickRise Marketing",
    "AdVantage Agency", "NeonBrand Studio", "FunnelCraft Digital", "BuzzHive Marketing"
  ],
  "Real Estate": [
    "PrimeNest Realty", "SkyView Properties", "UrbanEdge Real Estate",
    "KeyStone Property Group", "HomeVista Realty", "LandMark Brokers",
    "EagleView Properties", "HarborPoint Realty", "CrestLine Real Estate", "TrueHome Group"
  ],
  "Construction": [
    "IronForge Construction", "SolidBuild Contractors", "SkyHigh Builders",
    "FoundationFirst Construction", "SteelFrame Builders", "BlueRidge Construction",
    "PinnacleWorks Builders", "GroundUp Contractors", "StructurePro Construction", "ApexBuild Co"
  ]
};

const CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "Seattle, WA", "Austin, TX", "Miami, FL",
  "Denver, CO", "Portland, OR", "Atlanta, GA", "Dallas, TX",
  "San Francisco, CA", "Boston, MA", "Nashville, TN",
  "Charlotte, NC", "San Diego, CA", "Minneapolis, MN",
];

const FIRST_NAMES = ["John", "Jane", "Alex", "Emily", "Chris", "Sarah", "Michael", "Jessica", "David", "Amanda",
                     "Robert", "Lisa", "James", "Maria", "Daniel", "Ashley", "Kevin", "Nicole", "Brian", "Rachel"];
const LAST_NAMES = ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Garcia", "Martinez", "Anderson", "Taylor",
                    "Thomas", "Moore", "Jackson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Young"];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomUniform(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateMockLeads(industryFilter?: string, locationFilter?: string, count: number = 15) {
  const industries = Object.keys(COMPANY_NAMES);
  const mockData = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const ind = industryFilter || randomChoice(industries);
    const namePool = COMPANY_NAMES[ind] || [`Premier ${ind} Co`, `Elite ${ind} Group`, `Pro ${ind} Services`];
    
    let companyName = randomChoice(namePool);
    if (usedNames.has(companyName)) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      companyName = `${companyName} ${chars[randomInt(0, 25)]}${chars[randomInt(0, 25)]}`;
    }
    usedNames.add(companyName);

    const loc = locationFilter || randomChoice(CITIES);
    const ownerFirst = randomChoice(FIRST_NAMES);
    const ownerLast = randomChoice(LAST_NAMES);
    const domain = companyName.toLowerCase().replace(/ /g, "").replace(/&/g, "and").replace(/'/g, "") + ".com";

    const isEnriched = randomChoice([true, true, true, false]);
    const employeeCountOpts = [
      randomInt(3, 15),
      randomInt(15, 50),
      randomInt(50, 150),
      randomInt(150, 500)
    ];
    const revenueOpts = [
      randomUniform(100000, 500000),
      randomUniform(500000, 1500000),
      randomUniform(1500000, 5000000),
      randomUniform(5000000, 15000000)
    ];

    mockData.push({
      company_name: companyName,
      industry: ind,
      location: loc,
      website: `https://www.${domain}`,
      phone: `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      email: `info@${domain}`,
      owner_name: `${ownerFirst} ${ownerLast}`,
      employee_count: randomChoice(employeeCountOpts),
      estimated_revenue: Math.round(randomChoice(revenueOpts) * 100) / 100,
      linkedin_url: `https://linkedin.com/company/${domain.replace(".com", "")}`,
      source: "SaaSquatch Lead Engine",
      is_enriched: isEnriched
    });
  }

  return mockData;
}

export function scrapeLeads(params: any) {
  const ind = params.industry;
  const loc = params.location;
  return generateMockLeads(ind, loc, 15);
}
