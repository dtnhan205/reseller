import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatCurrency } from '@/utils/format';

interface ChartData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

interface TopProductItem {
  rank: number;
  productId: string | null;
  productName: string;
  totalOrders: number;
  totalRevenue: number;
}

interface RevenueChartProps {
  chartData: ChartData[];
}

// Custom tooltip (area + bar: payload order có thể khác nhau)
const CustomTooltip = ({ active, payload, label }: any) => {
  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  if (active && payload && payload.length) {
    const ordersEntry = payload.find((p: any) => p.dataKey === 'totalOrders');
    const revenueEntry = payload.find((p: any) => p.dataKey === 'totalRevenue');
    const orders = ordersEntry?.value ?? payload[0]?.value;
    const revenue = revenueEntry?.value ?? payload[1]?.value ?? 0;
    return (
      <div className="bg-gray-950/95 border border-cyan-500/30 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-xs mb-1">{label}</p>
        <p className="text-emerald-400 font-semibold">{orders} đơn</p>
        <p className="text-cyan-400 font-semibold">{formatCurrency(Number(revenue), language, usdToVnd)}</p>
      </div>
    );
  }
  return null;
};

export function RevenueAreaChart({ chartData }: RevenueChartProps) {
  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const formattedData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      dateLabel: item.date.slice(5), // MM-DD format
      displayDate: item.date,
    }));
  }, [chartData]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis
            dataKey="dateLabel"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value, language, usdToVnd).replace('₫', '').trim()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="totalOrders"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOrders)"
            name="Đơn hàng"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="totalRevenue"
            stroke="#22d3ee"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Doanh thu"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({ chartData }: RevenueChartProps) {
  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const formattedData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      dateLabel: item.date.slice(5),
    }));
  }, [chartData]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          barCategoryGap="18%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis
            dataKey="dateLabel"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value, language, usdToVnd).replace('₫', '').trim()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="totalOrders"
            name="Đơn hàng"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            yAxisId="right"
            dataKey="totalRevenue"
            name="Doanh thu"
            fill="#22d3ee"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopProductsChartProps {
  products: TopProductItem[];
  color: string;
}

export function TopProductsBarChart({ products, color }: TopProductsChartProps) {
  if (products.length === 0) return null;

  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    amber: '#f59e0b',
    green: '#22c55e',
  };

  const strokeColor = colorMap[color] || '#3b82f6';

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={products.slice(0, 5)}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
          <XAxis
            type="number"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="productName"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 11 }}
            width={80}
            tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: `1px solid ${strokeColor}50`,
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [String(value), 'Đơn hàng']}
            labelFormatter={(label: any) => String(label)}
          />
          <Bar
            dataKey="totalOrders"
            fill={strokeColor}
            radius={[0, 4, 4, 0]}
            background={{ fill: '#ffffff10' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Revenue distribution by period
interface PeriodRevenue {
  label: string;
  revenue: number;
  orders: number;
  color: string;
}

interface RevenuePieChartProps {
  periods: PeriodRevenue[];
}

export function RevenuePieChart({ periods }: RevenuePieChartProps) {
  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#22c55e'];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={periods}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="revenue"
            nameKey="label"
          >
            {periods.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #22d3ee50',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [formatCurrency(Number(value), language, usdToVnd), 'Doanh thu']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Stats summary chart
interface StatsData {
  label: string;
  value: number;
}

interface StatsBarChartProps {
  data: StatsData[];
  color: string;
}

export function StatsBarChart({ data, color }: StatsBarChartProps) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
          />
          <YAxis
            stroke="#ffffff60"
            tick={{ fill: '#ffffff80', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: `1px solid ${color}50`,
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [String(value), 'Giá trị']}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Export summary data
export interface ChartSummaryData {
  today: { totalOrders: number; totalRevenue: number };
  thisMonth: { totalOrders: number; totalRevenue: number };
  thisYear: { totalOrders: number; totalRevenue: number };
  allTime: { totalOrders: number; totalRevenue: number };
}

// Prepare pie chart data from stats
export function usePreparePieChartData(stats: ChartSummaryData) {
  const periods: PeriodRevenue[] = [
    { label: 'Hôm nay', revenue: stats.today.totalRevenue, orders: stats.today.totalOrders, color: 'blue' },
    { label: 'Tháng này', revenue: stats.thisMonth.totalRevenue, orders: stats.thisMonth.totalOrders, color: 'purple' },
    { label: 'Năm nay', revenue: stats.thisYear.totalRevenue, orders: stats.thisYear.totalOrders, color: 'amber' },
    { label: 'Tổng', revenue: stats.allTime.totalRevenue, orders: stats.allTime.totalOrders, color: 'green' },
  ];
  return periods;
}
