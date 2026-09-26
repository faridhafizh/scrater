import { ScrapeJobService } from './scrape-job.service';

describe('ScrapeJobService Deduplication & Job Runner', () => {
  let service: ScrapeJobService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      source: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'src-amazon-us',
          name: 'Amazon Best Sellers',
          region: 'US',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      scrapeJob: {
        create: jest.fn().mockResolvedValue({ id: 'job-123' }),
        update: jest.fn().mockResolvedValue({}),
      },
      trendingItem: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'item-1', name: 'Wireless Headphones', source_id: 'src-amazon-us' },
        ]),
        update: jest.fn().mockResolvedValue({ id: 'item-1', name: 'Wireless Headphones' }),
        create: jest.fn().mockResolvedValue({ id: 'item-2', name: 'New Water Bottle' }),
      },
    };

    service = new ScrapeJobService(mockPrisma as any);
  });

  it('should update existing item when deduplicating matching item name', async () => {
    const updated = await service.saveOrUpdateItem('src-amazon-us', 'US', {
      name: 'wireless headphones  ',
      price: 139.99,
      rank: 1,
    });

    expect(mockPrisma.trendingItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: expect.objectContaining({
        price: 139.99,
        rank: 1,
      }),
    });
    expect(updated.id).toBe('item-1');
  });

  it('should create new item when item name does not match existing entries', async () => {
    const created = await service.saveOrUpdateItem('src-amazon-us', 'US', {
      name: 'New Smart Mug',
      price: 79.99,
      rank: 4,
    });

    expect(mockPrisma.trendingItem.create).toHaveBeenCalled();
    expect(created.id).toBe('item-2');
  });

  it('should execute job successfully and record metrics', async () => {
    const result = await service.runScrapeJob('src-amazon-us');
    expect(result.status).toBe('success');
    expect(result.job_id).toBe('job-123');
    expect(mockPrisma.scrapeJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'job-123' },
        data: expect.objectContaining({ status: 'success' }),
      }),
    );
  });
});
