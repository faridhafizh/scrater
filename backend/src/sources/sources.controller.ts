import { Controller, Get, Param, Patch, Post, Body } from '@nestjs/common';
import { SourcesService } from './sources.service';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  getAllSources() {
    return this.sourcesService.getAllSources();
  }

  @Get(':id')
  getSourceById(@Param('id') id: string) {
    return this.sourcesService.getSourceById(id);
  }

  @Patch(':id')
  updateSource(
    @Param('id') id: string,
    @Body() body: { enabled?: boolean; schedule?: string },
  ) {
    return this.sourcesService.updateSource(id, body);
  }

  @Post(':id/run')
  runManualScrape(@Param('id') id: string) {
    return this.sourcesService.runManualScrape(id);
  }

  @Get(':id/jobs')
  getSourceJobs(@Param('id') id: string) {
    return this.sourcesService.getSourceJobs(id);
  }
}
