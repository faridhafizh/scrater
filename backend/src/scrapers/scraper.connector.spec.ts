import { ScraperConnector, TrendingItemDto } from './scraper.connector';

class TestConnector extends ScraperConnector {
  readonly id = 'test-connector';
  readonly name = 'Test Connector';
  readonly platform = 'Test';
  readonly type = 'marketplace' as const;

  async scrape(): Promise<TrendingItemDto[]> {
    return [
      {
        name: '  Test   Item  ',
        price: this.parsePrice('$19.99 USD'),
        rank: 1,
      },
    ];
  }

  public testClean(txt: string) {
    return this.cleanText(txt);
  }

  public testPrice(price: string) {
    return this.parsePrice(price);
  }
}

describe('ScraperConnector Base Class', () => {
  let connector: TestConnector;

  beforeEach(() => {
    connector = new TestConnector();
  });

  it('should clean whitespace from strings', () => {
    expect(connector.testClean('  hello   world  \n ')).toBe('hello world');
  });

  it('should parse prices correctly', () => {
    expect(connector.testPrice('$129.95')).toBe(129.95);
    expect(connector.testPrice('USD 45.00')).toBe(45);
    expect(connector.testPrice('invalid')).toBeUndefined();
  });

  it('should return normalized item DTOs', async () => {
    const items = await connector.scrape();
    expect(items.length).toBe(1);
    expect(items[0].price).toBe(19.99);
  });
});
