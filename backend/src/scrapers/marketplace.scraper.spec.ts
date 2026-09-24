import { AmazonScraper } from './amazon.scraper';
import { ShopeeScraper } from './shopee.scraper';

describe('Marketplace Scrapers', () => {
  describe('AmazonScraper', () => {
    it('should return valid trending items', async () => {
      const scraper = new AmazonScraper();
      const items = await scraper.scrape();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('name');
      expect(items[0]).toHaveProperty('price');
      expect(items[0].currency).toBe('USD');
    });
  });

  describe('ShopeeScraper', () => {
    it('should return valid trending items', async () => {
      const scraper = new ShopeeScraper();
      const items = await scraper.scrape();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('name');
      expect(items[0]).toHaveProperty('product_url');
    });
  });
});
