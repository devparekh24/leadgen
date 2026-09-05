import { PrismaClient } from '@prisma/client';
import { generateMockLeads } from '../src/services/scraper';
import { scoreLead } from '../src/services/scorer';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.lead.count();
  if (count > 0) {
    console.log('Database already seeded!');
    return;
  }

  console.log('Seeding database with 25 sample leads...');
  const seedLeads = generateMockLeads(undefined, undefined, 25);
  
  const stages = ["Prospect", "Contacted", "Meeting Set", "Closed Won", "Closed Lost"];

  for (const data of seedLeads) {
    const leadData: any = { ...data };
    leadData.pipeline_stage = stages[Math.floor(Math.random() * stages.length)];
    
    // Auto-score
    const scoreData = scoreLead(leadData);
    Object.assign(leadData, scoreData);

    await prisma.lead.create({ data: leadData });
  }

  console.log('Seeded 25 leads with scores!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
