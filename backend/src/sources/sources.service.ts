import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScrapeJobService } from '../jobs/scrape-job.service';

@Injectable()
export class SourcesService {
  constructor(
    private prisma: PrismaService,
    private scrapeJobService: ScrapeJobService,
  ) {}

  async getAllSources() {
    const sources = await this.prisma.source.findMany({
      include: {
        _count: {
          select: { items: true, scrapeJobs: true },
        },
      },
    });

    return sources.map((s) => ({
      ...s,
      item_count: s._count.items,
      job_count: s._count.scrapeJobs,
    }));
  }

  async getSourceById(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        scrapeJobs: {
          take: 10,
          orderBy: { started_at: 'desc' },
        },
      },
    });

    if (!source) {
      throw new NotFoundException(`Source ${id} not found`);
    }

    return source;
  }

  async updateSource(id: string, data: { enabled?: boolean; schedule?: string }) {
    await this.getSourceById(id);
    return this.prisma.source.update({
      where: { id },
      data,
    });
  }

  async runManualScrape(id: string) {
    await this.getSourceById(id);
    return this.scrapeJobService.runScrapeJob(id);
  }

  async getSourceJobs(id: string) {
    await this.getSourceById(id);
    return this.prisma.scrapeJob.findMany({
      where: { source_id: id },
      orderBy: { started_at: 'desc' },
      take: 20,
    });
  }
}
