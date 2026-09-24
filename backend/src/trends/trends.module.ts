import { Module } from '@nestjs/common';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';
import { CategoryService } from './category.service';
import { TrendScoreService } from './trend-score.service';

@Module({
  controllers: [TrendsController],
  providers: [TrendsService, CategoryService, TrendScoreService],
  exports: [TrendsService, CategoryService, TrendScoreService],
})
export class TrendsModule {}
