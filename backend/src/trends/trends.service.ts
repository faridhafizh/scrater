import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TrendsQueryDto {
  source_id?: string;
  category?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'rank' | 'scraped_at' | 'price' | 'score';
  sort_order?: 'asc' | 'desc';
}

@Injectable()
export class TrendsService {
  constructor(private prisma: PrismaService) {}

  async getTrends(query: TrendsQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.source_id) {
      where.source_id = query.source_id;
    }

    if (query.category) {
      where.normalized_category = query.category;
    }

    if (query.region) {
      where.source = { region: query.region };
    }

    if (query.search) {
      where.name = { contains: query.search };
    }

    const orderBy: any[] = [];
    const sortBy = query.sort_by || 'scraped_at';
    const sortOrder = query.sort_order || 'desc';

    if (sortBy === 'score') {
      orderBy.push({ trendScores: { _count: sortOrder } });
    } else {
      orderBy.push({ [sortBy]: sortOrder });
    }

    const [total, items] = await Promise.all([
      this.prisma.trendingItem.count({ where }),
      this.prisma.trendingItem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          source: true,
          trendScores: {
            orderBy: { computed_at: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const formattedItems = items.map((item) => {
      const latestScore = item.trendScores[0];
      return {
        id: item.id,
        name: item.name,
        external_id: item.external_id,
        category: item.category,
        normalized_category: item.normalized_category,
        price: item.price,
        currency: item.currency,
        image_url: item.image_url,
        product_url: item.product_url,
        popularity_signal: item.popularity_signal,
        rank: item.rank,
        scraped_at: item.scraped_at,
        source: {
          id: item.source.id,
          name: item.source.name,
          type: item.source.type,
          region: item.source.region,
        },
        trend_score: latestScore ? latestScore.score : 50.0,
      };
    });

    return {
      data: formattedItems,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getDashboardStats() {
    const [totalItems, totalSources, activeSources, totalJobs, categoryStats, recentJobs] =
      await Promise.all([
        this.prisma.trendingItem.count(),
        this.prisma.source.count(),
        this.prisma.source.count({ where: { enabled: true } }),
        this.prisma.scrapeJob.count(),
        this.prisma.trendingItem.groupBy({
          by: ['normalized_category'],
          _count: { id: true },
        }),
        this.prisma.scrapeJob.findMany({
          take: 5,
          orderBy: { started_at: 'desc' },
          include: { source: true },
        }),
      ]);

    const categoryBreakdown = categoryStats.map((c) => ({
      category: c.normalized_category,
      count: c._count.id,
    }));

    return {
      total_items: totalItems,
      total_sources: totalSources,
      active_sources: activeSources,
      total_jobs: totalJobs,
      category_breakdown: categoryBreakdown,
      recent_jobs: recentJobs,
    };
  }
}
