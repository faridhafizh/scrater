import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

export interface ReportScopeDto {
  sources?: string[];
  categories?: string[];
  date_range?: string; // "7d", "30d", "all"
}

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private reportsDir = path.join(process.cwd(), 'reports_output');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      orderBy: { generated_at: 'desc' },
    });
  }

  async getReportById(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return report;
  }

  async generateReport(scope: ReportScopeDto) {
    const report = await this.prisma.report.create({
      data: {
        scope: JSON.stringify(scope),
        status: 'processing',
      },
    });

    this.processPdfGeneration(report.id, scope).catch((err) => {
      this.logger.error(`PDF generation process failed for report ${report.id}: ${err.message}`);
    });

    return report;
  }

  private async processPdfGeneration(reportId: string, scope: ReportScopeDto) {
    let browser: puppeteer.Browser | null = null;
    try {
      const where: any = {};
      if (scope.sources && scope.sources.length > 0) {
        where.source_id = { in: scope.sources };
      }
      if (scope.categories && scope.categories.length > 0) {
        where.normalized_category = { in: scope.categories };
      }

      const items = await this.prisma.trendingItem.findMany({
        where,
        take: 50,
        orderBy: { scraped_at: 'desc' },
        include: {
          source: true,
          trendScores: { take: 1, orderBy: { computed_at: 'desc' } },
        },
      });

      const categoryCounts: Record<string, number> = {};
      items.forEach((item) => {
        const cat = item.normalized_category || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const htmlContent = this.buildReportHtml(items, categoryCounts, scope);

      const executablePath = fs.existsSync('/usr/bin/google-chrome')
        ? '/usr/bin/google-chrome'
        : undefined;

      browser = await puppeteer.launch({
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
        ],
        headless: true,
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'load' });

      const fileName = `scrater_report_${reportId}_${Date.now()}.pdf`;
      const filePath = path.join(this.reportsDir, fileName);

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      });

      await browser.close();
      browser = null;

      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'completed',
          file_path: filePath,
          item_count: items.length,
        },
      });

      this.logger.log(`Report ${reportId} generated successfully at ${filePath}`);
    } catch (err: any) {
      this.logger.error(`Failed to process PDF: ${err.message}`);
      if (browser) {
        await browser.close().catch(() => {});
      }
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'failed',
        },
      });
    }
  }

  private buildReportHtml(items: any[], categoryCounts: Record<string, number>, scope: ReportScopeDto): string {
    const totalItems = items.length;
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const dateStr = new Date().toLocaleDateString('en-US', { dateStyle: 'full' });

    const maxCatCount = Math.max(...Object.values(categoryCounts), 1);
    const categoryBarsHtml = Object.entries(categoryCounts)
      .map(([cat, count]) => {
        const pct = Math.round((count / maxCatCount) * 100);
        return `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
              <span>${cat}</span>
              <span>${count} items</span>
            </div>
            <div style="background: #e2e8f0; border-radius: 4px; height: 12px; width: 100%; overflow: hidden;">
              <div style="background: #4f46e5; height: 100%; width: ${pct}%;"></div>
            </div>
          </div>
        `;
      })
      .join('');

    const productCardsHtml = items
      .map((item, idx) => {
        const score = item.trendScores[0]?.score || 50;
        const sourceName = item.source?.name || 'Unknown Source';
        const priceStr = item.price ? `$${item.price.toFixed(2)}` : 'N/A';
        const imgUrl = item.image_url || 'https://via.placeholder.com/150';

        return `
          <div class="product-card">
            <div class="rank-badge">#${idx + 1}</div>
            <img src="${imgUrl}" class="product-img" onerror="this.src='https://via.placeholder.com/150'" />
            <div class="product-details">
              <div class="product-title">${item.name}</div>
              <div class="product-meta">
                <span class="category-pill">${item.normalized_category}</span>
                <span class="source-tag">${sourceName}</span>
              </div>
              <div class="product-metrics">
                <span class="price-text">${priceStr}</span>
                <span class="signal-text">${item.popularity_signal || 'Trending'}</span>
                <span class="score-badge">Trend Score: ${score}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Scrater Trending Consumer Goods Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            background: #ffffff;
          }
          .header {
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title {
            font-size: 26px;
            font-weight: 800;
            color: #1e1b4b;
            margin: 0;
          }
          .subtitle {
            font-size: 14px;
            color: #64748b;
            margin-top: 4px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
          }
          .metric-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
          }
          .metric-value {
            font-size: 24px;
            font-weight: 800;
            color: #4f46e5;
            margin-top: 4px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-top: 24px;
            margin-bottom: 16px;
          }
          .chart-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 32px;
          }
          .product-card {
            display: flex;
            align-items: center;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
            background: #ffffff;
          }
          .rank-badge {
            font-size: 18px;
            font-weight: 800;
            color: #4f46e5;
            width: 40px;
            text-align: center;
          }
          .product-img {
            width: 64px;
            height: 64px;
            object-fit: cover;
            border-radius: 6px;
            margin-right: 16px;
          }
          .product-details {
            flex: 1;
          }
          .product-title {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .product-meta {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 6px;
          }
          .category-pill {
            background: #e0e7ff;
            color: #3730a3;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
          }
          .source-tag {
            font-size: 11px;
            color: #64748b;
          }
          .product-metrics {
            display: flex;
            gap: 16px;
            font-size: 12px;
            align-items: center;
          }
          .price-text {
            font-weight: 700;
            color: #16a34a;
          }
          .signal-text {
            color: #d97706;
            font-weight: 500;
          }
          .score-badge {
            font-weight: 700;
            color: #4f46e5;
            margin-left: auto;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Scrater Trend Report</h1>
            <div class="subtitle">Global Consumer Goods Intelligence & Ranking Analysis</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div>Generated: ${dateStr}</div>
            <div>Scope: ${scope.sources?.length ? `${scope.sources.length} Sources` : 'All Sources'}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="metric-card">
            <div class="metric-label">Total Trending Items</div>
            <div class="metric-value">${totalItems}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Top Category</div>
            <div class="metric-value">${topCategory}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Market Coverage</div>
            <div class="metric-value">${Object.keys(categoryCounts).length} Categories</div>
          </div>
        </div>

        <div class="section-title">Category Distribution</div>
        <div class="chart-box">
          ${categoryBarsHtml || '<div>No items matched query scope</div>'}
        </div>

        <div class="section-title">Top Trending Product Rankings</div>
        <div>
          ${productCardsHtml || '<div>No product listings found for this report scope.</div>'}
        </div>

        <div class="footer">
          Report generated by Scrater Automated Trend Engine &bull; Single-User Intelligence System
        </div>
      </body>
      </html>
    `;
  }
}
