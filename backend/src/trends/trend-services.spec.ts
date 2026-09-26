import { CategoryService } from './category.service';
import { TrendScoreService } from './trend-score.service';

describe('CategoryService & TrendScoreService', () => {
  describe('CategoryService', () => {
    let categoryService: CategoryService;

    beforeEach(() => {
      categoryService = new CategoryService();
    });

    it('should map keywords to standard category taxonomy', () => {
      expect(categoryService.normalizeCategory('Audio & Tech', 'Bluetooth Earbuds')).toBe('Electronics');
      expect(categoryService.normalizeCategory('Apparel', 'Winter Hoodie')).toBe('Fashion');
      expect(categoryService.normalizeCategory('Home Decor', 'Sunset Lamp')).toBe('Home & Kitchen');
      expect(categoryService.normalizeCategory('Skincare', 'Face Serum')).toBe('Beauty');
      expect(categoryService.normalizeCategory('Random', 'Unknown Item')).toBe('General');
    });
  });

  describe('TrendScoreService', () => {
    let scoreService: TrendScoreService;

    beforeEach(() => {
      scoreService = new TrendScoreService({} as any);
    });

    it('should calculate higher composite scores for top rank and viral signals', () => {
      const topViralScore = scoreService.calculateScore(1, '#1 Best Seller in Audio', 2);
      const lowRankScore = scoreService.calculateScore(10, 'Normal item', 1);

      expect(topViralScore).toBeGreaterThan(lowRankScore);
      expect(topViralScore).toBeGreaterThan(100);
    });
  });
});
