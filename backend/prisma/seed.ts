import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial source connectors and trend data...');

  // 1. Create Default Scraper Sources
  const sourcesData = [
    {
      id: 'src-amazon-us',
      name: 'Amazon Best Sellers',
      type: 'marketplace',
      region: 'US',
      enabled: true,
      schedule: '0 7 * * *',
      status: 'success',
      last_run_at: new Date(Date.now() - 3600 * 1000 * 2), // 2 hours ago
    },
    {
      id: 'src-shopee-sea',
      name: 'Shopee Flash Sales & Trends',
      type: 'marketplace',
      region: 'SEA',
      enabled: true,
      schedule: '0 8 * * *',
      status: 'success',
      last_run_at: new Date(Date.now() - 3600 * 1000 * 4), // 4 hours ago
    },
    {
      id: 'src-gtrends-global',
      name: 'Google Trends (Shopping)',
      type: 'social',
      region: 'GLOBAL',
      enabled: true,
      schedule: '0 */6 * * *',
      status: 'success',
      last_run_at: new Date(Date.now() - 3600 * 1000 * 1), // 1 hour ago
    },
    {
      id: 'src-ebay-us',
      name: 'eBay Trending Goods',
      type: 'marketplace',
      region: 'US',
      enabled: true,
      schedule: '0 9 * * *',
      status: 'idle',
      last_run_at: new Date(Date.now() - 3600 * 1000 * 12),
    },
    {
      id: 'src-tiktok-global',
      name: 'TikTok Shop Viral Trends',
      type: 'social',
      region: 'GLOBAL',
      enabled: true,
      schedule: '0 */4 * * *',
      status: 'success',
      last_run_at: new Date(Date.now() - 3600 * 1000 * 3),
    },
  ];

  for (const s of sourcesData) {
    await prisma.source.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // 2. Create Initial Sample Scrape Jobs
  const now = new Date();
  await prisma.scrapeJob.createMany({
    data: [
      {
        source_id: 'src-amazon-us',
        started_at: new Date(now.getTime() - 7200 * 1000),
        finished_at: new Date(now.getTime() - 7180 * 1000),
        status: 'success',
        items_found: 12,
      },
      {
        source_id: 'src-shopee-sea',
        started_at: new Date(now.getTime() - 14400 * 1000),
        finished_at: new Date(now.getTime() - 14380 * 1000),
        status: 'success',
        items_found: 10,
      },
      {
        source_id: 'src-gtrends-global',
        started_at: new Date(now.getTime() - 3600 * 1000),
        finished_at: new Date(now.getTime() - 3590 * 1000),
        status: 'success',
        items_found: 8,
      },
      {
        source_id: 'src-tiktok-global',
        started_at: new Date(now.getTime() - 10800 * 1000),
        finished_at: new Date(now.getTime() - 10770 * 1000),
        status: 'success',
        items_found: 15,
      },
    ],
  });

  // 3. Create Sample Trending Items
  const items = [
    {
      id: 'item-1',
      source_id: 'src-amazon-us',
      external_id: 'B08N5WRWNW',
      name: 'Wireless Noise Cancelling Earbuds Pro',
      category: 'Audio & Electronics',
      normalized_category: 'Electronics',
      price: 89.99,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
      product_url: 'https://amazon.com/dp/B08N5WRWNW',
      popularity_signal: '#1 Best Seller in Earbuds',
      rank: 1,
    },
    {
      id: 'item-2',
      source_id: 'src-amazon-us',
      external_id: 'B09B2E5G11',
      name: 'Ergonomic Memory Foam Lumbar Support Pillow',
      category: 'Home & Kitchen',
      normalized_category: 'Home & Kitchen',
      price: 29.95,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
      product_url: 'https://amazon.com/dp/B09B2E5G11',
      popularity_signal: 'Rank #2 Movers & Shakers (+350%)',
      rank: 2,
    },
    {
      id: 'item-3',
      source_id: 'src-tiktok-global',
      external_id: 'TT-789231',
      name: 'Viral Thermal Color-Changing Water Bottle',
      category: 'Sports & Outdoors',
      normalized_category: 'Home & Kitchen',
      price: 19.99,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      product_url: 'https://tiktok.com/shop/water-bottle',
      popularity_signal: '1.2M Hashtag Views (#WaterBottleTok)',
      rank: 1,
    },
    {
      id: 'item-4',
      source_id: 'src-shopee-sea',
      external_id: 'SP-331290',
      name: 'Mini Portable LED Projector 1080P HD',
      category: 'Gadgets',
      normalized_category: 'Electronics',
      price: 45.0,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
      product_url: 'https://shopee.com/product/331290',
      popularity_signal: '4,500 Sold in Flash Sale',
      rank: 3,
    },
    {
      id: 'item-5',
      source_id: 'src-gtrends-global',
      external_id: 'GT-OVERSZT',
      name: 'Oversized Heavyweight Cotton Hoodie',
      category: 'Apparel',
      normalized_category: 'Fashion',
      price: 42.5,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
      product_url: 'https://trends.google.com/trends/explore?q=oversized+hoodie',
      popularity_signal: '+220% Search Volume Growth',
      rank: 1,
    },
    {
      id: 'item-6',
      source_id: 'src-ebay-us',
      external_id: 'EB-99120',
      name: 'Retro Mechanical Gaming Keyboard RGB',
      category: 'Computers & Accessories',
      normalized_category: 'Electronics',
      price: 64.99,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      product_url: 'https://ebay.com/itm/99120',
      popularity_signal: '250 Watching / 48 hrs',
      rank: 4,
    },
    {
      id: 'item-7',
      source_id: 'src-tiktok-global',
      external_id: 'TT-44109',
      name: 'Sunset Lamp Atmosphere LED Projection Light',
      category: 'Home Decor',
      normalized_category: 'Home & Kitchen',
      price: 14.99,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=500',
      product_url: 'https://tiktok.com/shop/sunset-lamp',
      popularity_signal: '850k Likes across videos',
      rank: 2,
    },
    {
      id: 'item-8',
      source_id: 'src-amazon-us',
      external_id: 'B07VGRX24Q',
      name: 'Hydrating Face Serum with Hyaluronic Acid',
      category: 'Beauty & Personal Care',
      normalized_category: 'Beauty',
      price: 18.5,
      currency: 'USD',
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
      product_url: 'https://amazon.com/dp/B07VGRX24Q',
      popularity_signal: '10,000+ Bought in past month',
      rank: 3,
    },
  ];

  for (const item of items) {
    await prisma.trendingItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });

    // Create trend score record for each item
    const scoreVal = Math.round((100 - (item.rank || 5) * 10 + Math.random() * 15) * 10) / 10;
    await prisma.trendScore.create({
      data: {
        item_id: item.id,
        score: scoreVal,
        contributing_sources: JSON.stringify([item.source_id]),
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
