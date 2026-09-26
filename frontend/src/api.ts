import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Source {
  id: string;
  name: string;
  type: string;
  region: string;
  enabled: boolean;
  schedule: string;
  last_run_at?: string;
  status: string;
  item_count?: number;
  job_count?: number;
}

export interface TrendingItem {
  id: string;
  name: string;
  external_id?: string;
  category?: string;
  normalized_category: string;
  price?: number;
  currency: string;
  image_url?: string;
  product_url?: string;
  popularity_signal?: string;
  rank?: number;
  scraped_at: string;
  source: {
    id: string;
    name: string;
    type: string;
    region: string;
  };
  trend_score: number;
}

export interface ScrapeJob {
  id: string;
  source_id: string;
  started_at: string;
  finished_at?: string;
  status: string;
  items_found: number;
  error_message?: string;
  source?: { name: string };
}

export interface Report {
  id: string;
  generated_at: string;
  scope: string;
  status: string;
  file_path?: string;
  item_count: number;
}

export interface DashboardStats {
  total_items: number;
  total_sources: number;
  active_sources: number;
  total_jobs: number;
  category_breakdown: { category: string; count: number }[];
  recent_jobs: ScrapeJob[];
}

export const getSources = async () => (await api.get<Source[]>('/sources')).data;

export const updateSource = async (id: string, data: { enabled?: boolean; schedule?: string }) =>
  (await api.patch<Source>(`/sources/${id}`, data)).data;

export const runSourceScrape = async (id: string) =>
  (await api.post<{ job_id: string; items_found: number; status: string }>(`/sources/${id}/run`)).data;

export const getSourceJobs = async (id: string) =>
  (await api.get<ScrapeJob[]>(`/sources/${id}/jobs`)).data;

export const getTrends = async (params: {
  source_id?: string;
  category?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}) =>
  (
    await api.get<{
      data: TrendingItem[];
      meta: { total: number; page: number; limit: number; pages: number };
    }>('/trends', { params })
  ).data;

export const getDashboardStats = async () =>
  (await api.get<DashboardStats>('/dashboard/stats')).data;

export const getReports = async () => (await api.get<Report[]>('/reports')).data;

export const generateReport = async (scope: {
  sources?: string[];
  categories?: string[];
  date_range?: string;
}) => (await api.post<Report>('/reports/generate', scope)).data;

export const downloadReportUrl = (id: string) => `/api/reports/${id}/download`;
