import { GoogleTrendsScraper } from './google-trends.scraper';
import { EbayScraper } from './ebay.scraper';
import { TiktokShopScraper } from './tiktok.scraper';

describe('Social & Regional Scrapers', () => {
  describe('GoogleTrendsScraper', () => {
    it('should return valid trending items', async () => {
      const scraper = new GoogleTrendsScraper();
      const items = await scraper.scrape();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('name');
      expect(items[0]).toHaveProperty('popularity_signal');
    });
  });

  describe('EbayScraper', () => {
    it('should return valid trending items', async () => {
      const scraper = new EbayScraper();
      const items = await scraper.scrape();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('name');
    });
  });

  describe('TiktokShopScraper', () => {
    it('should return valid trending items', async () => {
      const scraper = new TiktokShopScraper();
      const items = await scraper.scrape();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('name');
    });
  });
});
