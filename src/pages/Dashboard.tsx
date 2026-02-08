import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Package, Users, ShoppingBag, TrendingUp } from 'lucide-react';

interface Stats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  scheduled: number;
  converted: number;
  lost: number;
  hot: number;
  warm: number;
  cold: number;
  avgScore: number;
  last30Days: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, productsRes, wishlistsRes] = await Promise.all([
          api.get('/api/admin/leads/stats'),
          api.get('/api/admin/products'),
          api.get('/api/admin/wishlists'),
        ]);

        setStats(leadsRes.data.stats);
        setProductCount(productsRes.data.pagination.total);
        setWishlistCount(wishlistsRes.data.pagination.total);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Jewels & Time CMS</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={productCount}
          icon={<Package className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          title="Total Leads"
          value={stats?.total || 0}
          icon={<Users className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          title="Wishlists"
          value={wishlistCount}
          icon={<ShoppingBag className="w-8 h-8" />}
          color="purple"
        />
        <StatCard
          title="Avg Lead Score"
          value={Math.round(stats?.avgScore || 0)}
          icon={<TrendingUp className="w-8 h-8" />}
          color="orange"
          suffix="/100"
        />
      </div>

      {/* Lead Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Pipeline</h2>
            <div className="space-y-3">
              <PipelineItem label="New" count={stats.new} total={stats.total} color="gray" />
              <PipelineItem label="Contacted" count={stats.contacted} total={stats.total} color="blue" />
              <PipelineItem label="Qualified" count={stats.qualified} total={stats.total} color="yellow" />
              <PipelineItem label="Scheduled" count={stats.scheduled} total={stats.total} color="purple" />
              <PipelineItem label="Converted" count={stats.converted} total={stats.total} color="green" />
              <PipelineItem label="Lost" count={stats.lost} total={stats.total} color="red" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Quality</h2>
            <div className="space-y-4">
              <QualityItem
                label="🔴 Hot Leads"
                count={stats.hot}
                percentage={(stats.hot / stats.total) * 100}
                color="red"
              />
              <QualityItem
                label="🟡 Warm Leads"
                count={stats.warm}
                percentage={(stats.warm / stats.total) * 100}
                color="yellow"
              />
              <QualityItem
                label="🔵 Cold Leads"
                count={stats.cold}
                percentage={(stats.cold / stats.total) * 100}
                color="blue"
              />
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Last 30 Days: <span className="font-semibold text-gray-900">{stats.last30Days} new leads</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, suffix = '' }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}{suffix}
          </p>
        </div>
        <div className={`${colors[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function PipelineItem({ label, count, total, color }: any) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colors: Record<string, string> = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QualityItem({ label, count, percentage }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <div className="text-right">
        <span className="font-semibold text-gray-900">{count}</span>
        <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
}
