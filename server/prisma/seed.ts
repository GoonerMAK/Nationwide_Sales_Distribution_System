import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const regions = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

const areasByRegion = {
  Dhaka: ['Mirpur', 'Dhanmondi', 'Gulshan', 'Uttara', 'Mohammadpur', 'Banani', 'Badda'],
  Chittagong: ['Agrabad', 'Nasirabad', 'Panchlaish', 'Khulshi', 'Halishahar'],
  Rajshahi: ['Boalia', 'Matihar', 'Rajpara', 'Shaheb Bazar'],
  Khulna: ['Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali'],
  Barisal: ['Sadar', 'Kotwali', 'Rupatoli', 'Kashipur'],
  Sylhet: ['Zindabazar', 'Ambarkhana', 'Bondor Bazar', 'Uposhohor'],
  Rangpur: ['Mahiganj', 'Satmatha', 'Munshipara', 'Dhap'],
  Mymensingh: ['Charpara', 'Kachari', 'Ganginarpar', 'Maskanda'],
};

const territoryPrefixes = ['North', 'South', 'East', 'West', 'Central'];

const distributorNames = [
  'Bengal Distributors Ltd',
  'Delta Trade Corp',
  'Meghna Enterprises',
  'Jamuna Distribution',
  'Padma Wholesale',
  'Surma Trading House',
  'Karnaphuli Suppliers',
  'Teesta Logistics',
  'Buriganga Trade',
  'Sangu Distribution',
  'Rupsha Trading',
  'Gorai Enterprises',
  'Brahmaputra Wholesale',
  'Atrai Suppliers',
  'Bhairab Distribution',
];

const retailerPrefixes = [
  'Store',
  'Shop',
  'Mart',
  'Outlet',
  'Bazaar',
  'Market',
  'Trading',
  'Enterprise',
  'Traders',
  'Brothers',
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

/** Picks 3–5 territory names for an area, e.g. "North Mirpur". Falls back to a numbered name if prefixes collide. */
function buildTerritoryNames(areaName: string): string[] {
  const names: string[] = [];
  const usedPrefixes = new Set<string>();
  const numTerritories = randomInt(3, 5);

  for (let i = 0; i < numTerritories; i++) {
    let prefix = random(territoryPrefixes);
    let attempts = 0;

    while (usedPrefixes.has(prefix) && attempts < 20) {
      prefix = random(territoryPrefixes);
      attempts++;
    }

    names.push(
      usedPrefixes.has(prefix) ? `${prefix} ${areaName} ${i + 1}` : `${prefix} ${areaName}`,
    );
    usedPrefixes.add(prefix);
  }

  return names;
}

/** Groups items by a key once, so later lookups are O(1) instead of re-filtering the array per row. */
function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

async function main() {
  if (process.env.RUN_SEED !== 'true') {
    console.log('RUN_SEED is false. Skipping seed.');
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

  // Tables are empty, so bulk insert: one query per step.
  console.log('🌍 Creating 8 regions...');
  const createdRegions = await prisma.region.createManyAndReturn({
    data: regions.map((name) => ({ name })),
  });
  console.log(`  ✓ Created ${createdRegions.length} regions`);

  console.log('📍 Creating areas...');
  const createdAreas = await prisma.area.createManyAndReturn({
    data: createdRegions.flatMap((region) =>
      areasByRegion[region.name as keyof typeof areasByRegion].map((areaName) => ({
        name: areaName,
        region_id: region.id,
      })),
    ),
  });
  console.log(`  ✓ Created ${createdAreas.length} areas`);

  console.log('🗺️  Creating territories...');
  const createdTerritories = await prisma.territory.createManyAndReturn({
    data: createdAreas.flatMap((area) =>
      buildTerritoryNames(area.name).map((name) => ({ name, area_id: area.id })),
    ),
  });
  console.log(`  ✓ Created ${createdTerritories.length} territories`);

  console.log('🏢 Creating 15 distributors...');
  const createdDistributors = await prisma.distributor.createManyAndReturn({
    data: distributorNames.map((name) => ({ name })),
  });
  console.log(`  ✓ Created ${createdDistributors.length} distributors`);

  console.log('👥 Creating 2,000 sales representatives...');
  const totalSalesReps = 2000;
  const repIndexes = Array.from({ length: totalSalesReps }, (_, idx) => idx);

  const createdUsers = await prisma.user.createManyAndReturn({
    data: repIndexes.map((idx) => ({
      email: `salesrep${idx}@example.com`,
      password: `$2b$10$hashedpassword${idx}`,
    })),
    select: { id: true, email: true },
  });
  // RETURNING order is not guaranteed, so link reps to users by email rather than array position.
  const userIdByEmail = new Map(createdUsers.map((user) => [user.email, user.id]));

  const areasByRegionId = groupBy(createdAreas, (area) => area.region_id);
  const territoriesByAreaId = groupBy(createdTerritories, (territory) => territory.area_id);

  const createdSalesReps = await prisma.salesRepresentative.createManyAndReturn({
    data: repIndexes.map((idx) => {
      const region = random(createdRegions);
      const area = random(areasByRegionId.get(region.id)!);
      const territory = random(territoriesByAreaId.get(area.id)!);

      return {
        user_id: userIdByEmail.get(`salesrep${idx}@example.com`)!,
        username: `salesrep${idx}`,
        name: `Sales Rep ${idx}`,
        phone: generatePhone(),
        region_id: region.id,
        area_id: area.id,
        territory_id: territory.id,
      };
    }),
  });
  console.log(`  ✓ Created ${createdSalesReps.length} sales representatives`);

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

      retailers.push({
        name: `${random(retailerPrefixes)} ${randomInt(1000, 9999)}`,
        phone: Math.random() > 0.2 ? generatePhone() : null,
        region_id: salesRep.region_id!,
        area_id: salesRep.area_id!,
        territory_id: salesRep.territory_id!,
        distributor_id: random(createdDistributors).id,
        sales_representative_id: salesRep.id,
        points: randomInt(0, 1000),
        routes: random(routes),
      });
    }

    await prisma.retailer.createMany({
      data: retailers,
      skipDuplicates: true,
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
    prisma.retailer.count(),
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
        select: { retailers: true },
      },
    },
  });

  const maxRetailers = Math.max(...repWithRetailerCount.map((rep) => rep._count.retailers));
  const avgRetailers =
    repWithRetailerCount.reduce((sum, rep) => sum + rep._count.retailers, 0) /
    repWithRetailerCount.length;

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
