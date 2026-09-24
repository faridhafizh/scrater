export interface TrendingItemDto {
  external_id?: string;
  name: string;
  category?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  product_url?: string;
  popularity_signal?: string;
  rank?: number;
}

export interface ScraperSourceConfig {
  id: string;
  name: string;
  type: string;
  region: string;
  enabled: boolean;
  schedule: string;
}

export abstract class ScraperConnector {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly platform: string;
  abstract readonly type: 'marketplace' | 'social';

  /**
   * Fetches and parses raw listings into normalized TrendingItemDto objects
   */
  abstract scrape(config?: ScraperSourceConfig): Promise<TrendingItemDto[]>;

  /**
   * Helper utility to clean raw string values
   */
  protected cleanText(text: string): string {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
  }

  /**
   * Helper utility to parse price strings into floating numbers
   */
  protected parsePrice(priceStr: string): number | undefined {
    if (!priceStr) return undefined;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
}
