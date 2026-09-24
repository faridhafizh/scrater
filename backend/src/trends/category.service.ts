import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const STANDARD_CATEGORIES = [
  'Electronics',
  'Home & Kitchen',
  'Fashion',
  'Beauty',
  'Sports & Outdoors',
  'Toys & Games',
  'Food & Beverage',
  'General',
] as const;

export type StandardCategory = typeof STANDARD_CATEGORIES[number];

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  private categoryMap: Record<string, StandardCategory> = {
    // Electronics
    audio: 'Electronics',
    earbuds: 'Electronics',
    headphones: 'Electronics',
    gadgets: 'Electronics',
    computers: 'Electronics',
    wearables: 'Electronics',
    mobile: 'Electronics',
    accessories: 'Electronics',
    gaming: 'Electronics',
    // Home & Kitchen
    home: 'Home & Kitchen',
    kitchen: 'Home & Kitchen',
    decor: 'Home & Kitchen',
    appliances: 'Home & Kitchen',
    pillow: 'Home & Kitchen',
    mug: 'Home & Kitchen',
    // Fashion
    apparel: 'Fashion',
    clothing: 'Fashion',
    hoodie: 'Fashion',
    shoes: 'Fashion',
    fashion: 'Fashion',
    // Beauty
    beauty: 'Beauty',
    skincare: 'Beauty',
    cosmetics: 'Beauty',
    personal: 'Beauty',
    hair: 'Beauty',
    // Sports & Outdoors
    sports: 'Sports & Outdoors',
    outdoors: 'Sports & Outdoors',
    fitness: 'Sports & Outdoors',
    water: 'Sports & Outdoors',
    // Food & Beverage
    food: 'Food & Beverage',
    beverage: 'Food & Beverage',
    coffee: 'Food & Beverage',
    matcha: 'Food & Beverage',
    // Toys & Games
    toys: 'Toys & Games',
    games: 'Toys & Games',
  };

  /**
   * Maps source raw category or product title to standard category taxonomy
   */
  normalizeCategory(rawCategory?: string, itemTitle?: string): StandardCategory {
    const textToMatch = `${rawCategory || ''} ${itemTitle || ''}`.toLowerCase();

    for (const [key, stdCategory] of Object.entries(this.categoryMap)) {
      if (textToMatch.includes(key)) {
        return stdCategory;
      }
    }

    return 'General';
  }

  /**
   * Bulk updates normalized categories for database items
   */
  async normalizeAllItems(prisma: PrismaService): Promise<number> {
    const items = await prisma.trendingItem.findMany();
    let updated = 0;

    for (const item of items) {
      const normalized = this.normalizeCategory(item.category || undefined, item.name);
      if (item.normalized_category !== normalized) {
        await prisma.trendingItem.update({
          where: { id: item.id },
          data: { normalized_category: normalized },
        });
        updated++;
      }
    }

    return updated;
  }
}
