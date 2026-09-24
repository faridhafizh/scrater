import { Controller, Get, Post, Param, Body, Res, NotFoundException } from '@nestjs/common';
import { ReportService, ReportScopeDto } from './report.service';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  getAllReports() {
    return this.reportService.getAllReports();
  }

  @Get(':id')
  getReportById(@Param('id') id: string) {
    return this.reportService.getReportById(id);
  }

  @Post('generate')
  generateReport(@Body() scope: ReportScopeDto) {
    return this.reportService.generateReport(scope);
  }

  @Get(':id/download')
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const report = await this.reportService.getReportById(id);
    if (!report.file_path || !fs.existsSync(report.file_path)) {
      throw new NotFoundException(`PDF file for report ${id} is not ready or missing`);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=scrater_report_${id}.pdf`);
    const fileStream = fs.createReadStream(report.file_path);
    fileStream.pipe(res);
  }
}
