import { Controller, Get, Query } from '@nestjs/common';
import { TrendsService, TrendsQueryDto } from './trends.service';

@Controller()
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  @Get('trends')
  getTrends(@Query() query: TrendsQueryDto) {
    return this.trendsService.getTrends(query);
  }

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.trendsService.getDashboardStats();
  }
}
