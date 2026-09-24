import { TrendsService } from './trends.service';

describe('TrendsService', () => {
  let service: TrendsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      trendingItem: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'item-1',
            name: 'Earbuds',
            category: 'Audio',
            normalized_category: 'Electronics',
            price: 49.99,
            currency: 'USD',
            rank: 1,
            scraped_at: new Date(),
            source: { id: 'src-1', name: 'Amazon', type: 'marketplace', region: 'US' },
            trendScores: [{ score: 85.5 }],
          },
        ]),
        groupBy: jest.fn().mockResolvedValue([{ normalized_category: 'Electronics', _count: { id: 1 } }]),
      },
      source: {
        count: jest.fn().mockResolvedValue(5),
      },
      scrapeJob: {
        count: jest.fn().mockResolvedValue(10),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    service = new TrendsService(mockPrisma as any);
  });

  it('should query trends with filtering and return metadata', async () => {
    const res = await service.getTrends({ category: 'Electronics', page: 1, limit: 10 });
    expect(res.data.length).toBe(1);
    expect(res.data[0].normalized_category).toBe('Electronics');
    expect(res.data[0].trend_score).toBe(85.5);
    expect(res.meta.total).toBe(1);
  });

  it('should compile dashboard stats', async () => {
    const stats = await service.getDashboardStats();
    expect(stats.total_items).toBe(1);
    expect(stats.total_sources).toBe(5);
    expect(stats.category_breakdown.length).toBe(1);
  });
});
