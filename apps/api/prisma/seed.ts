import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedProducts = [
  {
    name: 'Minimal Desk Lamp',
    description: 'Warm adjustable lamp for focused work sessions.',
    priceCents: 4599,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    stock: 18,
  },
  {
    name: 'Everyday Canvas Tote',
    description: 'Durable cotton tote for groceries, books, and commute gear.',
    priceCents: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    stock: 32,
  },
  {
    name: 'Ceramic Coffee Set',
    description: 'Two handmade ceramic cups with a matte glaze finish.',
    priceCents: 3899,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80',
    stock: 12,
  },
  {
    name: 'Walnut Desk Organizer',
    description: 'Compact organizer for pens, notes, cables, and small tools.',
    priceCents: 3299,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    stock: 20,
  },
];

async function main() {
  const existingCount = await prisma.product.count();

  if (existingCount > 0) {
    return;
  }

  await prisma.product.createMany({
    data: seedProducts,
  });
}

await main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
