import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScraperConnector, TrendingItemDto } from '../scrapers/scraper.connector';
import { AmazonScraper } from '../scrapers/amazon.scraper';
import { ShopeeScraper } from '../scrapers/shopee.scraper';
import { GoogleTrendsScraper } from '../scrapers/google-trends.scraper';
import { EbayScraper } from '../scrapers/ebay.scraper';
import { TiktokShopScraper } from '../scrapers/tiktok.scraper';

@Injectable()
export class ScrapeJobService {
  private readonly logger = new Logger(ScrapeJobService.name);
  private connectors: Map<string, ScraperConnector> = new Map();

  constructor(private prisma: PrismaService) {
    this.registerConnectors();
  }

  private registerConnectors() {
    const list: ScraperConnector[] = [
      new AmazonScraper(),
      new ShopeeScraper(),
      new GoogleTrendsScraper(),
      new EbayScraper(),
      new TiktokShopScraper(),
    ];

    for (const connector of list) {
      this.connectors.set(connector.id, connector);
    }
  }

  getConnector(sourceId: string): ScraperConnector | undefined {
    return this.connectors.get(sourceId);
  }

  getAllConnectors(): ScraperConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Executes scrape job for a given source ID
   */
  async runScrapeJob(sourceId: string): Promise<{ job_id: string; items_found: number; status: string }> {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) {
      throw new Error(`Source with ID ${sourceId} not found`);
    }

    const connector = this.connectors.get(sourceId);
    if (!connector) {
      throw new Error(`No scraper connector registered for source ID ${sourceId}`);
    }

    // Create job record
    const job = await this.prisma.scrapeJob.create({
      data: {
        source_id: sourceId,
        started_at: new Date(),
        status: 'running',
      },
    });

    // Update source status to running
    await this.prisma.source.update({
      where: { id: sourceId },
      data: { status: 'running' },
    });

    try {
      this.logger.log(`Starting scrape job for ${source.name}...`);
      const rawItems = await connector.scrape(source);

      let savedCount = 0;
      for (const itemDto of rawItems) {
        const deduplicated = await this.saveOrUpdateItem(sourceId, source.region, itemDto);
        if (deduplicated) savedCount++;
      }

      const finishedAt = new Date();
      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: {
          finished_at: finishedAt,
          status: 'success',
          items_found: savedCount,
        },
      });

      await this.prisma.source.update({
        where: { id: sourceId },
        data: {
          status: 'success',
          last_run_at: finishedAt,
        },
      });

      this.logger.log(`Scrape job completed for ${source.name}. ${savedCount} items processed.`);
      return { job_id: job.id, items_found: savedCount, status: 'success' };
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown scrape error';
      this.logger.error(`Scrape job failed for ${source.name}: ${errorMsg}`);

      await this.prisma.scrapeJob.update({
        where: { id: job.id },
        data: {
          finished_at: new Date(),
          status: 'failed',
          error_message: errorMsg,
        },
      });

      await this.prisma.source.update({
        where: { id: sourceId },
        data: { status: 'failed' },
      });

      return { job_id: job.id, items_found: 0, status: 'failed' };
    }
  }

  /**
   * Deduplicates and saves items based on normalized title + source_id
   */
  async saveOrUpdateItem(sourceId: string, region: string, dto: TrendingItemDto) {
    const normalizedName = dto.name.trim().toLowerCase();

    // Check if an existing item from this source matches normalized name
    const existingItems = await this.prisma.trendingItem.findMany({
      where: { source_id: sourceId },
    });

    const match = existingItems.find((i) => i.name.trim().toLowerCase() === normalizedName);

    if (match) {
      // Update existing item
      return await this.prisma.trendingItem.update({
        where: { id: match.id },
        data: {
          price: dto.price ?? match.price,
          popularity_signal: dto.popularity_signal ?? match.popularity_signal,
          rank: dto.rank ?? match.rank,
          image_url: dto.image_url ?? match.image_url,
          product_url: dto.product_url ?? match.product_url,
          scraped_at: new Date(),
        },
      });
    } else {
      // Create new item
      return await this.prisma.trendingItem.create({
        data: {
          source_id: sourceId,
          external_id: dto.external_id,
          name: dto.name,
          category: dto.category || 'General',
          price: dto.price,
          currency: dto.currency || 'USD',
          image_url: dto.image_url,
          product_url: dto.product_url,
          popularity_signal: dto.popularity_signal,
          rank: dto.rank,
          scraped_at: new Date(),
        },
      });
    }
  }
}
