// Seed the database with the 12 products and a demo user
// Run with: bun run /home/z/my-project/scripts/seed.ts

import { db } from "../src/lib/db";
import { products } from "../src/lib/data";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate (order matters due to FK constraints)
  console.log("🧹 Cleaning existing data...");
  await db.review.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.address.deleteMany();
  await db.product.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();

  // 1. Seed products
  console.log(`📦 Seeding ${products.length} products...`);
  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.id },
      update: {},
      create: {
        slug: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        currency: p.currency,
        rating: p.rating,
        reviewCount: p.reviewCount,
        images: JSON.stringify(p.images),
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        badge: p.badge ?? null,
        description: p.description,
        shortDescription: p.shortDescription,
        materials: JSON.stringify(p.materials),
        craftsmanship: p.craftsmanship,
        care: p.care,
        origin: p.origin,
        sustainability: p.sustainability,
        fit: p.fit,
        features: JSON.stringify(p.features),
        sku: p.sku,
        inStock: p.inStock,
      },
    });
  }
  console.log("✅ Products seeded");

  // 2. Create demo user
  console.log("👤 Creating demo user...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await db.user.upsert({
    where: { email: "isabella.laurent@example.com" },
    update: {},
    create: {
      email: "isabella.laurent@example.com",
      name: "Isabella Laurent",
      passwordHash,
      phone: "+1 (415) 555-0142",
      dob: "1992-04-18",
      gender: "Female",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      memberSince: "March 2021",
      tier: "Gold",
      loyaltyPoints: 2840,
      lifetimeSpend: 14250,
    },
  });

  // 3. Create addresses for demo user
  console.log("🏠 Seeding addresses...");
  // Clear existing addresses first (sqlite doesn't support skipDuplicates)
  await db.address.deleteMany({ where: { userId: user.id } });
  await db.address.createMany({
    data: [
      {
        userId: user.id,
        label: "Home",
        fullName: "Isabella Laurent",
        line1: "1184 Fillmore Street",
        line2: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        postalCode: "94115",
        country: "United States",
        phone: "+1 (415) 555-0142",
        isDefault: true,
      },
      {
        userId: user.id,
        label: "Office",
        fullName: "Isabella Laurent",
        line1: "415 Mission Street",
        line2: "Floor 18",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "United States",
        phone: "+1 (415) 555-0142",
        isDefault: false,
      },
    ],
  });

  // 4. Create sample orders for demo user
  console.log("📦 Seeding orders...");
  const coatProduct = await db.product.findUnique({ where: { slug: "p1" } });
  const bagProduct = await db.product.findUnique({ where: { slug: "p5" } });
  const sweaterProduct = await db.product.findUnique({ where: { slug: "p3" } });
  const shirtProduct = await db.product.findUnique({ where: { slug: "p7" } });

  if (coatProduct) {
    const order1 = await db.order.create({
      data: {
        orderNumber: "ME-2483719",
        userId: user.id,
        status: "Shipped",
        subtotal: 689,
        shipping: 0,
        tax: 55,
        total: 744,
        shippingAddress: "1184 Fillmore Street, Apt 4B, San Francisco, CA 94115",
        trackingNumber: "1Z999AA10123456784",
        items: {
          create: {
            productId: coatProduct.id,
            name: "Camille Wool-Blend Tailored Coat",
            image: coatProduct.images.split(",")[0].replace(/[\[\]"]/g, ""),
            size: "S",
            color: "Camel",
            quantity: 1,
            price: 689,
          },
        },
      },
    });
  }

  if (bagProduct) {
    await db.order.create({
      data: {
        orderNumber: "ME-2483720",
        userId: user.id,
        status: "Delivered",
        subtotal: 525,
        shipping: 0,
        tax: 42,
        total: 567,
        shippingAddress: "1184 Fillmore Street, Apt 4B, San Francisco, CA 94115",
        trackingNumber: "1Z999AA10123456790",
        items: {
          create: {
            productId: bagProduct.id,
            name: "Mira Structured Leather Tote",
            image: bagProduct.images.split(",")[0].replace(/[\[\]"]/g, ""),
            size: "ONE SIZE",
            color: "Cognac",
            quantity: 1,
            price: 525,
          },
        },
      },
    });
  }

  if (sweaterProduct && shirtProduct) {
    await db.order.create({
      data: {
        orderNumber: "ME-2483721",
        userId: user.id,
        status: "Delivered",
        subtotal: 430,
        shipping: 0,
        tax: 34,
        total: 464,
        shippingAddress: "1184 Fillmore Street, Apt 4B, San Francisco, CA 94115",
        items: {
          create: [
            {
              productId: sweaterProduct.id,
              name: "Edmonton Cashmere Crewneck",
              image: sweaterProduct.images.split(",")[0].replace(/[\[\]"]/g, ""),
              size: "M",
              color: "Oat",
              quantity: 1,
              price: 285,
            },
            {
              productId: shirtProduct.id,
              name: "Heritage Oxford Cloth Shirt",
              image: shirtProduct.images.split(",")[0].replace(/[\[\]"]/g, ""),
              size: "M",
              color: "Pale Blue",
              quantity: 1,
              price: 145,
            },
          ],
        },
      },
    });
  }

  // 5. Create wishlist items
  console.log("❤️ Seeding wishlist...");
  const wishlistProducts = await db.product.findMany({
    where: { slug: { in: ["p2", "p9", "p12"] } },
  });
  for (const p of wishlistProducts) {
    await db.wishlistItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId: p.id },
      },
      update: {},
      create: { userId: user.id, productId: p.id },
    });
  }

  // 6. Create sample reviews
  console.log("⭐ Seeding reviews...");
  const sampleReviews = [
    {
      productSlug: "p1",
      authorName: "Marguerite Chen",
      rating: 5,
      title: "Worth every penny",
      body: "I've had this coat for two winters now and it still looks brand new. The wool is heavy and luxurious, the cut is flattering, and the construction is impeccable. You can feel the quality the moment you put it on.",
      verified: true,
    },
    {
      productSlug: "p1",
      authorName: "Alexandre Petit",
      rating: 5,
      title: "Florentine craftsmanship at its best",
      body: "Bought this on a trip to Florence and visited the atelier. Seeing how it was made gave me a whole new appreciation for the piece. The hand-padded canvas gives it a structure that cheaper coats just can't replicate.",
      verified: true,
    },
    {
      productSlug: "p3",
      authorName: "Sophie Laurent",
      rating: 5,
      title: "The perfect cashmere",
      body: "Soft, warm, and the fit is exactly right. I have it in three colors now. After a year of regular wear, no pilling at all — which is more than I can say for any other cashmere I own.",
      verified: true,
    },
    {
      productSlug: "p5",
      authorName: "Camille Rousseau",
      rating: 4,
      title: "Beautiful, develops gorgeous patina",
      body: "The leather is exceptional and the saddle-stitching is clearly visible. Only knock: it's heavier than I expected. But that's also why it'll last decades. The patina after 6 months of daily use is already stunning.",
      verified: true,
    },
    {
      productSlug: "p9",
      authorName: "Henri Dubois",
      rating: 5,
      title: "Built to outlive me",
      body: "I wear these 5 days a week. After 18 months, they finally need a resole — which the atelier does for free. Try getting that from any other boot brand. The hand-welting is the real deal.",
      verified: true,
    },
    {
      productSlug: "p2",
      authorName: "Olivia Martin",
      rating: 5,
      title: "Bias-cut perfection",
      body: "The way this dress moves is unreal. The silk is heavy enough to drape beautifully but light enough to feel like nothing. Wore it to a gallery opening and got three compliments before I made it to the bar.",
      verified: true,
    },
  ];

  for (const r of sampleReviews) {
    const product = await db.product.findUnique({ where: { slug: r.productSlug } });
    if (product) {
      await db.review.create({
        data: {
          productId: product.id,
          authorName: r.authorName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verified: r.verified,
        },
      });
    }
  }

  console.log("\n✨ Seed complete!");
  console.log("📧 Demo login: isabella.laurent@example.com");
  console.log("🔑 Demo password: demo1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
