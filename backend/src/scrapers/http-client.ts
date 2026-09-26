import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

export class HttpClient {
  private static defaultHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  };

  static async getHtml(url: string, config: AxiosRequestConfig = {}): Promise<cheerio.CheerioAPI> {
    const response = await axios.get(url, {
      headers: { ...this.defaultHeaders, ...config.headers },
      timeout: 10000,
      ...config,
    });
    return cheerio.load(response.data);
  }

  static async getJson<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await axios.get<T>(url, {
      headers: { ...this.defaultHeaders, ...config.headers },
      timeout: 10000,
      ...config,
    });
    return response.data;
  }
}
