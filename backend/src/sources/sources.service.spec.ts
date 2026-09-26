import { SourcesService } from './sources.service';

describe('SourcesService', () => {
  let service: SourcesService;
  let mockPrisma: any;
  let mockJobService: any;

  beforeEach(() => {
    mockPrisma = {
      source: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'src-1', name: 'Amazon', _count: { items: 10, scrapeJobs: 2 } },
        ]),
        findUnique: jest.fn().mockResolvedValue({ id: 'src-1', name: 'Amazon' }),
        update: jest.fn().mockResolvedValue({ id: 'src-1', enabled: false }),
      },
      scrapeJob: {
        findMany: jest.fn().mockResolvedValue([{ id: 'job-1', status: 'success' }]),
      },
    };

    mockJobService = {
      runScrapeJob: jest.fn().mockResolvedValue({ job_id: 'job-1', status: 'success' }),
    };

    service = new SourcesService(mockPrisma as any, mockJobService as any);
  });

  it('should list all sources with item and job counts', async () => {
    const sources = await service.getAllSources();
    expect(sources.length).toBe(1);
    expect(sources[0].item_count).toBe(10);
  });

  it('should update source config', async () => {
    const updated = await service.updateSource('src-1', { enabled: false });
    expect(mockPrisma.source.update).toHaveBeenCalledWith({
      where: { id: 'src-1' },
      data: { enabled: false },
    });
    expect(updated.enabled).toBe(false);
  });

  it('should trigger manual scrape', async () => {
    const res = await service.runManualScrape('src-1');
    expect(mockJobService.runScrapeJob).toHaveBeenCalledWith('src-1');
    expect(res.status).toBe('success');
  });
});
