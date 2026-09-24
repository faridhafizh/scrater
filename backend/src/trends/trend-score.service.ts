import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrendScoreService {
  private readonly logger = new Logger(TrendScoreService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculates composite trend score for an item
   * Components:
   * 1. Base Rank Score: Higher rank position = higher score (Rank 1 = 50 pts)
   * 2. Popularity Signal Boost: Mentions, views, sales keywords (+10 to +30 pts)
   * 3. Cross-Source Appearance: Items appearing across multiple sources receive multiplier boost (+20 pts per additional source)
   */
  calculateScore(itemRank?: number, popularitySignal?: string, crossSourceCount: number = 1): number {
    let score = 50;

    // Rank bonus
    if (itemRank && itemRank > 0) {
      score += Math.max(0, 50 - (itemRank - 1) * 5);
    } else {
      score += 20;
    }

    // Popularity signal keywords boost
    if (popularitySignal) {
      const sig = popularitySignal.toLowerCase();
      if (sig.includes('best seller') || sig.includes('viral') || sig.includes('1m') || sig.includes('sold in flash')) {
        score += 25;
      } else if (sig.includes('movers') || sig.includes('watch') || sig.includes('growth') || sig.includes('sold')) {
        score += 15;
      } else {
        score += 5;
      }
    }

    // Cross-source multiplier boost
    if (crossSourceCount > 1) {
      score += (crossSourceCount - 1) * 20;
    }

    return Math.round(score * 10) / 10;
  }

  /**
   * Recalculates and stores trend scores for all current items in the database
   */
  async computeAllTrendScores(): Promise<number> {
    const items = await this.prisma.trendingItem.findMany({
      include: { source: true },
    });

    let computed = 0;

    for (const item of items) {
      // Find similar named items across sources for cross-source boost
      const normalizedName = item.name.trim().toLowerCase();
      const matchingItems = items.filter(
        (i) => i.name.trim().toLowerCase() === normalizedName,
      );

      const contributingSources = Array.from(new Set(matchingItems.map((i) => i.source.name)));
      const scoreValue = this.calculateScore(
        item.rank || undefined,
        item.popularity_signal || undefined,
        contributingSources.length,
      );

      // Create or update trend score record
      const existingScore = await this.prisma.trendScore.findFirst({
        where: { item_id: item.id },
      });

      if (existingScore) {
        await this.prisma.trendScore.update({
          where: { id: existingScore.id },
          data: {
            score: scoreValue,
            computed_at: new Date(),
            contributing_sources: JSON.stringify(contributingSources),
          },
        });
      } else {
        await this.prisma.trendScore.create({
          data: {
            item_id: item.id,
            score: scoreValue,
            contributing_sources: JSON.stringify(contributingSources),
          },
        });
      }

      computed++;
    }

    return computed;
  }
}
