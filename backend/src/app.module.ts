import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SourcesModule } from './sources/sources.module';
import { TrendsModule } from './trends/trends.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './jobs/scheduler.service';
import { ScrapeJobService } from './jobs/scrape-job.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    SourcesModule,
    TrendsModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [SchedulerService, ScrapeJobService],
})
export class AppModule {}
