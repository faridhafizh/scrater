import { PrismaClient } from '@prisma/client';
import { ReportService } from './reports/report.service';

async function testPdfEngine() {
  console.log('Testing PDF Report Engine...');
  const prisma = new PrismaClient();
  const reportService = new ReportService(prisma as any);

  try {
    const report = await reportService.generateReport({
      sources: [],
      categories: [],
      date_range: 'all',
    });

    console.log(`Report created with ID: ${report.id}. Waiting for PDF generation...`);

    let attempts = 0;
    while (attempts < 15) {
      await new Promise((res) => setTimeout(res, 1000));
      const check = await reportService.getReportById(report.id);
      console.log(`Poll attempt ${attempts + 1}: status = ${check.status}`);

      if (check.status === 'completed') {
        console.log(`PDF successfully generated at: ${check.file_path}`);
        process.exit(0);
      } else if (check.status === 'failed') {
        console.error('PDF generation status failed!');
        process.exit(1);
      }
      attempts++;
    }

    console.error('PDF generation timed out.');
    process.exit(1);
  } catch (err) {
    console.error('Error during PDF engine test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPdfEngine();
