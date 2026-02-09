import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, UserPlus, Award, TrendingUp, Mail, Phone } from 'lucide-react';
import CustomerDetailModal from '../components/CustomerDetailModal';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalCollections: number;
  totalLeads: number;
  highestScore: number;
  hasConverted: boolean;
}

interface Stats {
  total: number;
  newThisMonth: number;
  withConversions: number;
  avgScore: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [customersRes, statsRes] = await Promise.all([
        api.get('/api/admin/customers'),
        api.get('/api/admin/customers/stats')
      ]);
      setCustomers(customersRes.data.customers);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">{stats?.total || 0} registered customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-green-600">{stats?.newThisMonth || 0}</p>
            </div>
            <UserPlus className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Conversions</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.withConversions || 0}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-amber-600">{stats?.avgScore || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => setSelectedCustomerId(customer.id)}
            className="bg-white rounded-lg shadow p-4 cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </div>
                )}
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span>{customer.totalCollections} collections</span>
                <span>{customer.totalLeads} leads</span>
              </div>
              <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
            {customer.highestScore > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      customer.highestScore >= 61 ? 'bg-red-500' :
                      customer.highestScore >= 31 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${customer.highestScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </div>
                  {customer.hasConverted && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-0.5">
                      <Award className="w-3 h-3" /> Converted
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {customer.totalCollections}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {customer.totalLeads}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[80px]">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            customer.highestScore >= 61 ? 'bg-red-500' :
                            customer.highestScore >= 31 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${customer.highestScore}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {customer.highestScore}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No registered customers yet.</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
