import { PrismaClient } from '@prisma/client';
import type { UserRole } from '@vps-template/contracts/auth';
import type { ProductCategory } from '@vps-template/contracts/products';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  password: string;
  role: UserRole;
};

type SeedProduct = {
  name: string;
  description: string;
  category: ProductCategory;
  priceCents: number;
  imageUrl: string;
  stock: number;
};

const seedUsers: SeedUser[] = [
  { email: 'admin@example.com', password: 'admin-password', role: 'admin' },
  { email: 'manager@example.com', password: 'manager-password', role: 'admin' },
  { email: 'customer@example.com', password: 'correct-password', role: 'customer' },
  { email: 'shopper@example.com', password: 'shopper-password', role: 'customer' },
];

const seedProducts: SeedProduct[] = [
  {
    name: 'Minimal Desk Lamp',
    description: 'Warm adjustable lamp for focused work sessions.',
    category: 'workspace',
    priceCents: 4599,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    stock: 18,
  },
  {
    name: 'Walnut Desk Organizer',
    description: 'Compact organizer for pens, notes, cables, and small tools.',
    category: 'workspace',
    priceCents: 3299,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    stock: 20,
  },
  {
    name: 'Everyday Canvas Tote',
    description: 'Durable cotton tote for groceries, books, and commute gear.',
    category: 'bags',
    priceCents: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    stock: 32,
  },
  {
    name: 'Waxed Utility Backpack',
    description: 'Weather-resistant pack with padded laptop storage and brass hardware.',
    category: 'bags',
    priceCents: 7899,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    stock: 14,
  },
  {
    name: 'Ceramic Coffee Set',
    description: 'Two handmade ceramic cups with a matte glaze finish.',
    category: 'kitchen',
    priceCents: 3899,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80',
    stock: 12,
  },
  {
    name: 'Glass Pour-Over Carafe',
    description: 'Heat-safe glass carafe with a reusable stainless steel filter.',
    category: 'kitchen',
    priceCents: 4299,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    stock: 9,
  },
  {
    name: 'Linen Throw Pillow',
    description: 'Soft washed linen pillow with a removable feather insert.',
    category: 'decor',
    priceCents: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80',
    stock: 24,
  },
  {
    name: 'Oak Wall Shelf',
    description: 'Floating oak shelf for small books, ceramics, and framed prints.',
    category: 'decor',
    priceCents: 5299,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
    stock: 8,
  },
  {
    name: 'Aromatherapy Diffuser',
    description: 'Quiet ceramic diffuser with timed mist settings for evening routines.',
    category: 'wellness',
    priceCents: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
    stock: 16,
  },
  {
    name: 'Cork Yoga Block Pair',
    description: 'Dense natural cork support blocks for stretching and recovery.',
    category: 'wellness',
    priceCents: 2799,
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80',
    stock: 21,
  },
  {
    name: 'Compression Packing Cubes',
    description: 'Three-piece packing cube set for organized weekend travel.',
    category: 'travel',
    priceCents: 3199,
    imageUrl: 'https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?auto=format&fit=crop&w=900&q=80',
    stock: 27,
  },
  {
    name: 'Insulated Travel Tumbler',
    description: 'Leak-resistant tumbler that keeps drinks hot or cold on long commutes.',
    category: 'travel',
    priceCents: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
    stock: 30,
  },
];

function configuredAdmin(): SeedUser | null {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  return email && password ? { email, password, role: 'admin' } : null;
}

async function seedUser({ email, password, role }: SeedUser) {
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role },
    create: { email: email.toLowerCase(), passwordHash, role },
  });
}

async function seedProduct(product: SeedProduct) {
  const existing = await prisma.product.findFirst({ where: { name: product.name } });

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: { ...product, isActive: true },
    });
    return;
  }

  await prisma.product.create({ data: product });
}

async function main() {
  const users = [configuredAdmin(), ...seedUsers].filter((user): user is SeedUser => Boolean(user));

  for (const user of users) {
    await seedUser(user);
  }

  for (const product of seedProducts) {
    await seedProduct(product);
  }
}

await main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
