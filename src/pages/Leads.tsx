import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, TrendingUp, Mail, Phone, List, LayoutGrid } from 'lucide-react';
import LeadDetailModal from '../components/LeadDetailModal';
import LeadPipeline from '../components/LeadPipeline';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  category: string;
  createdAt: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params: any = { limit: 50, sort: 'score_desc' };
        if (filter !== 'all') {
          params.status = filter.toUpperCase();
        }

        const response = await api.get('/api/admin/leads', { params });
        setLeads(response.data.leads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading leads...</div>
      </div>
    );
  }

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.score >= 61).length,
    warm: leads.filter(l => l.score >= 31 && l.score < 61).length,
    cold: leads.filter(l => l.score < 31).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">{stats.total} total leads</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors flex-1 sm:flex-none justify-center ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors flex-1 sm:flex-none justify-center ${
              viewMode === 'pipeline' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Pipeline
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">🔴 Hot Leads</p>
              <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">🟡 Warm Leads</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warm}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">🔵 Cold Leads</p>
              <p className="text-2xl font-bold text-blue-600">{stats.cold}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'pipeline' ? (
        <LeadPipeline />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New
              </button>
              <button
                onClick={() => setFilter('contacted')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'contacted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Contacted
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setFilter('converted')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'converted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Converted
              </button>
              <button
                onClick={() => setFilter('lost')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'lost' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lost
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer active:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{lead.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{lead.score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        lead.status === 'NEW'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.status === 'CONTACTED'
                          ? 'bg-purple-100 text-purple-800'
                          : lead.status === 'SCHEDULED'
                          ? 'bg-orange-100 text-orange-800'
                          : lead.status === 'CONVERTED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lead.status}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                      {lead.source}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        lead.score >= 61
                          ? 'bg-red-500'
                          : lead.score >= 31
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Leads Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {lead.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                    {lead.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'NEW'
                        ? 'bg-blue-100 text-blue-800'
                        : lead.status === 'CONTACTED'
                        ? 'bg-purple-100 text-purple-800'
                        : lead.status === 'SCHEDULED'
                        ? 'bg-orange-100 text-orange-800'
                        : lead.status === 'CONVERTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            lead.score >= 61
                              ? 'bg-red-500'
                              : lead.score >= 31
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {lead.score}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{lead.category}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          {/* Lead Detail Modal */}
          {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={() => {
            // Refresh leads list after update
            const fetchLeads = async () => {
              try {
                const params: any = { limit: 50, sort: 'score_desc' };
                if (filter !== 'all') {
                  params.status = filter.toUpperCase();
                }
                const response = await api.get('/api/admin/leads', { params });
                setLeads(response.data.leads);
              } catch (error) {
                console.error('Error fetching leads:', error);
              }
            };
            fetchLeads();
          }}
        />
          )}
        </>
      )}
    </div>
  );
}
