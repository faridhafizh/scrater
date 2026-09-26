import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { ScrapeJobService } from '../jobs/scrape-job.service';

@Module({
  controllers: [SourcesController],
  providers: [SourcesService, ScrapeJobService],
  exports: [SourcesService],
})
export class SourcesModule {}
