import { useState } from 'react';
import {
  TrendingUp,
  Database,
  FileText,
  Activity,
  Play,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Layers,
  BarChart3,
} from 'lucide-react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  getSources,
  updateSource,
  runSourceScrape,
  getTrends,
  getDashboardStats,
  getReports,
  generateReport,
  downloadReportUrl,
  TrendingItem,
} from './api';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainDashboard />
    </QueryClientProvider>
  );
}

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'sources' | 'reports'>('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">SCRATER</h1>
              <p className="text-xs text-indigo-200">Consumer Goods Trend Aggregator & Intelligence</p>
            </div>
          </div>

          <nav className="flex space-x-1 bg-indigo-950 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'trends' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trends Browser</span>
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'sources' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Scrape Sources</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Reports</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'sources' && <SourcesTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Scrater v1.0 &bull; Automated E-Commerce & Social Trend Engine
      </footer>
    </div>
  );
}

/* ================= OVERVIEW TAB ================= */
function OverviewTab({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: recentTrends } = useQuery({
    queryKey: ['recentTrends'],
    queryFn: () => getTrends({ limit: 4, sort_by: 'score', sort_order: 'desc' }),
  });

  if (isLoading || !stats) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard intelligence...</div>;
  }

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const categoryBreakdown = stats.category_breakdown || [];

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scraped Goods</span>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.total_items}</div>
          <p className="text-xs text-slate-500 mt-1">Aggregated across all target platforms</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Scraper Connectors</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats.active_sources} / {stats.total_sources}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">100% Operational</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scrape Executions</span>
            <RefreshCw className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.total_jobs}</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled and manual runs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">PDF Reports</span>
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">Ready</div>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-2 px-3 rounded-lg transition text-center"
          >
            Generate Custom PDF &rarr;
          </button>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Category Volume Breakdown</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Scored Items Teaser */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Top Rated Trends</h2>
              <button
                onClick={() => onNavigate('trends')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentTrends?.data?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-xl transition"
                >
                  <img
                    src={item.image_url || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.source?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-black px-2 py-1 rounded-md">
                      {item.trend_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= TRENDS BROWSER TAB ================= */
function TrendsTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sourceId, setSourceId] = useState('');

  const { data: sources } = useQuery({ queryKey: ['sources'], queryFn: getSources });
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['trends', search, category, sourceId],
    queryFn: () =>
      getTrends({
        search,
        category: category || undefined,
        source_id: sourceId || undefined,
        limit: 20,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Trending Goods Index</h2>
            <p className="text-xs text-slate-500">
              Browse, filter, and score live products collected across marketplaces & platforms
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search product title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Fashion">Fashion</option>
            <option value="Beauty">Beauty</option>
            <option value="Sports & Outdoors">Sports & Outdoors</option>
          </select>

          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="">All Scrape Sources</option>
            {sources?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {(search || category || sourceId) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setSourceId('');
              }}
              className="text-xs text-indigo-600 font-bold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid Cards of Trending Items */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Fetching trending items...</div>
      ) : trendsData?.data?.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
          No matching trending products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendsData?.data?.map((item) => (
            <TrendingProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingProductCard({ item }: { item: TrendingItem }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="relative h-48 bg-slate-100">
          <img
            src={item.image_url || 'https://via.placeholder.com/300'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
            {item.normalized_category}
          </div>
          <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">
            Score: {item.trend_score}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.source?.name}</p>
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{item.name}</h3>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-extrabold text-emerald-600 text-sm">
              {item.price ? `$${item.price.toFixed(2)}` : 'N/A'}
            </span>
            <span className="text-amber-600 bg-amber-50 font-bold px-2 py-0.5 rounded-md text-[11px]">
              {item.popularity_signal || 'Trending'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <a
          href={item.product_url || '#'}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1"
        >
          <span>View Source Listing</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

/* ================= SOURCES TAB ================= */
function SourcesTab() {
  const queryClient = useQueryClient();
  const { data: sources, isLoading } = useQuery({ queryKey: ['sources'], queryFn: getSources });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateSource(id, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sources'] }),
  });

  const runMutation = useMutation({
    mutationFn: (id: string) => runSourceScrape(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sources'] }),
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading scraper connectors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Scraper Connectors & Schedules</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage target platform crawlers, schedule execution intervals, and run manual extraction jobs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources?.map((source) => (
          <div key={source.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  source.type === 'marketplace'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-purple-50 text-purple-700'
                }`}
              >
                {source.type} &bull; {source.region}
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={(e) =>
                    toggleMutation.mutate({ id: source.id, enabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{source.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Cron Schedule: {source.schedule}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold capitalize">{source.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scraped Items:</span>
                <span className="font-bold">{source.item_count || 0}</span>
              </div>
            </div>

            <button
              onClick={() => runMutation.mutate(source.id)}
              disabled={runMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runMutation.isPending ? 'Scraping...' : 'Run Scraper Now'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= REPORTS TAB ================= */
function ReportsTab() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({ queryKey: ['reports'], queryFn: getReports });

  const generateMutation = useMutation({
    mutationFn: (scope: { sources?: string[]; categories?: string[] }) => generateReport(scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setShowModal(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">PDF Report Archive</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate print-ready executive trend summaries with charts and category rankings
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition shadow-md flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Generate New PDF Report</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500">Loading reports archive...</div>
      ) : reports?.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500">
          No generated reports found. Click above to generate your first PDF report!
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Report ID</th>
                <th className="px-6 py-4">Generated Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Item Count</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports?.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                    {report.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {new Date(report.generated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        report.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : report.status === 'processing'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {report.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {report.status === 'processing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span className="capitalize">{report.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{report.item_count} items</td>
                  <td className="px-6 py-4 text-right">
                    {report.status === 'completed' && (
                      <a
                        href={downloadReportUrl(report.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-1.5 px-3 rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <h3 className="text-xl font-black text-slate-900">Generate PDF Report</h3>
            <p className="text-xs text-slate-500">
              Select the scope and filters for your executive trend report.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Scope</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none">
                  <option>All Scraped Sources & Categories</option>
                  <option>Marketplaces Only</option>
                  <option>Social Trends Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => generateMutation.mutate({})}
                disabled={generateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition"
              >
                {generateMutation.isPending ? 'Generating...' : 'Start PDF Generation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
