import dotenv from "dotenv";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const regions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 
  'Sylhet', 'Rangpur', 'Mymensingh'
];

const areasByRegion = {
  'Dhaka': ['Mirpur', 'Dhanmondi', 'Gulshan', 'Uttara', 'Mohammadpur', 'Banani', 'Badda'],
  'Chittagong': ['Agrabad', 'Nasirabad', 'Panchlaish', 'Khulshi', 'Halishahar'],
  'Rajshahi': ['Boalia', 'Matihar', 'Rajpara', 'Shaheb Bazar'],
  'Khulna': ['Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali'],
  'Barisal': ['Sadar', 'Kotwali', 'Rupatoli', 'Kashipur'],
  'Sylhet': ['Zindabazar', 'Ambarkhana', 'Bondor Bazar', 'Uposhohor'],
  'Rangpur': ['Mahiganj', 'Satmatha', 'Munshipara', 'Dhap'],
  'Mymensingh': ['Charpara', 'Kachari', 'Ganginarpar', 'Maskanda']
};

const territoryPrefixes = ['North', 'South', 'East', 'West', 'Central'];

const distributorNames = [
  'Bengal Distributors Ltd', 'Delta Trade Corp', 'Meghna Enterprises',
  'Jamuna Distribution', 'Padma Wholesale', 'Surma Trading House',
  'Karnaphuli Suppliers', 'Teesta Logistics', 'Buriganga Trade',
  'Sangu Distribution', 'Rupsha Trading', 'Gorai Enterprises',
  'Brahmaputra Wholesale', 'Atrai Suppliers', 'Bhairab Distribution'
];

const retailerPrefixes = [
  'Store', 'Shop', 'Mart', 'Outlet', 'Bazaar', 'Market', 
  'Trading', 'Enterprise', 'Traders', 'Brothers'
];

const routes = ['Route A', 'Route B', 'Route C', 'Route D', 'Route E'];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  return `+880${randomInt(13, 19)}${String(randomInt(10000000, 99999999))}`;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  if (process.env.RUN_SEED !== "true") {
    console.log("RUN_SEED is false. Skipping seed.");
    return;
  }

  console.log('🌱 Starting seed...');

  console.log('🗑️  Clearing existing data...');
  await prisma.retailer.deleteMany();
  await prisma.salesRepresentative.deleteMany();
  await prisma.territory.deleteMany();
  await prisma.area.deleteMany();
  await prisma.region.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌍 Creating/fetching 8 regions...');
  const createdRegions = [];
  for (const name of regions) {
    const region = await prisma.region.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    createdRegions.push(region);
  }
  console.log(`  ✓ Processed ${createdRegions.length} regions`);

  console.log('📍 Creating/fetching areas...');
  const createdAreas = [];
  for (const region of createdRegions) {
    const areaNames = areasByRegion[region.name as keyof typeof areasByRegion];
    for (const areaName of areaNames) {
      const area = await prisma.area.upsert({
        where: { 
          name_region_id: {
            name: areaName,
            region_id: region.id
          }
        },
        update: {},
        create: {
          name: areaName,
          region_id: region.id
        }
      });
      createdAreas.push(area);
    }
  }
  console.log(`  ✓ Processed ${createdAreas.length} areas`);

  console.log('🗺️  Creating territories...');
  const createdTerritories = [];
  for (const area of createdAreas) {
    const numTerritories = randomInt(3, 5);
    const usedPrefixes = new Set<string>();
    
    for (let i = 0; i < numTerritories; i++) {
      let prefix = random(territoryPrefixes);
      let attempts = 0;
      
      while (usedPrefixes.has(prefix) && attempts < 20) {
        prefix = random(territoryPrefixes);
        attempts++;
      }
      
      const territoryName = usedPrefixes.has(prefix) 
        ? `${prefix} ${area.name} ${i + 1}`
        : `${prefix} ${area.name}`;
      
      usedPrefixes.add(prefix);
      
      const territory = await prisma.territory.create({
        data: {
          name: territoryName,
          area_id: area.id
        }
      });
      createdTerritories.push(territory);
    }
  }
  console.log(`  ✓ Created ${createdTerritories.length} territories`);

  console.log('🏢 Creating 15 distributors...');
  const createdDistributors = await prisma.$transaction(
    distributorNames.map(name => prisma.distributor.create({ data: { name } }))
  );
  console.log(`  ✓ Created ${createdDistributors.length} distributors`);

  console.log('👥 Creating 2,000 sales representatives...');
  const batchSize = 500;
  const totalSalesReps = 2000;
  const createdSalesReps = [];

  for (let i = 0; i < totalSalesReps; i += batchSize) {
    const currentBatch = Math.min(batchSize, totalSalesReps - i);
    
    for (let j = 0; j < currentBatch; j++) {
      const idx = i + j;
      const user = await prisma.user.create({
        data: {
          email: `salesrep${idx}@example.com`,
          password: `$2b$10$hashedpassword${idx}`
        }
      });

      const region = random(createdRegions);
      const regionAreas = createdAreas.filter(a => a.region_id === region.id);
      const area = random(regionAreas);
      const areaTerritories = createdTerritories.filter(t => t.area_id === area.id);
      const territory = random(areaTerritories);

      const salesRep = await prisma.salesRepresentative.create({
        data: {
          user_id: user.id,
          username: `salesrep${idx}`,
          name: `Sales Rep ${idx}`,
          phone: generatePhone(),
          region_id: region.id,
          area_id: area.id,
          territory_id: territory.id
        }
      });
      createdSalesReps.push(salesRep);
    }
    console.log(`  ✓ Created ${i + currentBatch}/${totalSalesReps} sales representatives`);
  }

  console.log('🏪 Creating 140,000 retailers in batches...');
  const totalRetailers = 140000;
  const retailerBatchSize = 1000;
  let retailerCount = 0;

  const shuffledSalesReps = shuffle(createdSalesReps);
  let salesRepIndex = 0;
  let retailersPerRep = 0;

  for (let i = 0; i < totalRetailers; i += retailerBatchSize) {
    const retailers = [];
    const currentBatch = Math.min(retailerBatchSize, totalRetailers - i);
    
    for (let j = 0; j < currentBatch; j++) {
      const idx = i + j;
      
      let salesRep = shuffledSalesReps[salesRepIndex];
      if (retailersPerRep >= 70) {
        salesRepIndex++;
        if (salesRepIndex >= shuffledSalesReps.length) {
          salesRepIndex = 0; 
        }
        salesRep = shuffledSalesReps[salesRepIndex];
        retailersPerRep = 0;
      }
      retailersPerRep++;

      const territory = createdTerritories.find(t => t.id === salesRep.territory_id);
      const area = createdAreas.find(a => a.id === territory?.area_id);
      const region = createdRegions.find(r => r.id === area?.region_id);

      retailers.push({
        name: `${random(retailerPrefixes)} ${randomInt(1000, 9999)}`,
        phone: Math.random() > 0.2 ? generatePhone() : null,
        region_id: region!.id,
        area_id: area!.id,
        territory_id: territory!.id,
        distributor_id: random(createdDistributors).id,
        sales_representative_id: salesRep.id,
        points: randomInt(0, 1000),
        routes: random(routes)
      });
    }

    await prisma.retailer.createMany({
      data: retailers,
      skipDuplicates: true
    });
    retailerCount += currentBatch;
    console.log(`  ✓ Created ${retailerCount}/${totalRetailers} retailers`);
  }

  const counts = await prisma.$transaction([
    prisma.user.count(),
    prisma.region.count(),
    prisma.area.count(),
    prisma.territory.count(),
    prisma.distributor.count(),
    prisma.salesRepresentative.count(),
    prisma.retailer.count()
  ]);

  console.log('\n✅ Seeding completed!');
  console.log('📊 Final counts:');
  console.log(`  Users: ${counts[0]}`);
  console.log(`  Regions: ${counts[1]}`);
  console.log(`  Areas: ${counts[2]}`);
  console.log(`  Territories: ${counts[3]}`);
  console.log(`  Distributors: ${counts[4]}`);
  console.log(`  Sales Representatives: ${counts[5]}`);
  console.log(`  Retailers: ${counts[6]}`);
  console.log(`\n🎉 Total records: ${counts.reduce((a, b) => a + b, 0)}`);

  const repWithRetailerCount = await prisma.salesRepresentative.findMany({
    include: {
      _count: {
        select: { retailers: true }
      }
    }
  });
  
  const maxRetailers = Math.max(...repWithRetailerCount.map(rep => rep._count.retailers));
  const avgRetailers = repWithRetailerCount.reduce((sum, rep) => sum + rep._count.retailers, 0) / repWithRetailerCount.length;
  
  console.log('\n📈 Retailer Distribution:');
  console.log(`  Max retailers per sales rep: ${maxRetailers}`);
  console.log(`  Avg retailers per sales rep: ${avgRetailers.toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });