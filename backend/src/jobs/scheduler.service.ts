import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScrapeJobService } from './scrape-job.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private scrapeJobService: ScrapeJobService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Scheduler Service initialized.');
  }

  // Periodic polling every hour to check enabled source schedules
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledScrapes() {
    this.logger.log('Checking scheduled scraper jobs...');
    const enabledSources = await this.prisma.source.findMany({
      where: { enabled: true },
    });

    for (const source of enabledSources) {
      try {
        await this.scrapeJobService.runScrapeJob(source.id);
      } catch (e: any) {
        this.logger.error(`Scheduled scrape failed for source ${source.id}: ${e.message}`);
      }
    }
  }
}
