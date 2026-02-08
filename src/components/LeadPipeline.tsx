import { useState, useEffect } from 'react';
import api from '../lib/api';
import { TrendingUp, Mail, Phone, Calendar, User, MessageSquare } from 'lucide-react';
import LeadDetailModal from './LeadDetailModal';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  category: string;
  message?: string;
  wishlistId?: string;
  createdAt: string;
  updatedAt: string;
}

const PIPELINE_STAGES = [
  { id: 'NEW', name: 'New', color: 'bg-blue-500' },
  { id: 'CONTACTED', name: 'Contacted', color: 'bg-yellow-500' },
  { id: 'QUALIFIED', name: 'Qualified', color: 'bg-purple-500' },
  { id: 'SCHEDULED', name: 'Scheduled', color: 'bg-orange-500' },
  { id: 'CONVERTED', name: 'Converted', color: 'bg-green-500' },
  { id: 'LOST', name: 'Lost', color: 'bg-gray-500' },
];

export default function LeadPipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/api/admin/leads', {
        params: { limit: 200, sort: 'createdAt_desc' },
      });
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await api.put(`/api/admin/leads/${leadId}`, { status: newStatus });

      // Update local state
      setLeads(leads.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Failed to update lead status');
      // Refresh leads to revert UI
      fetchLeads();
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredStage(stageId);
  };

  const handleDragLeave = () => {
    setHoveredStage(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setHoveredStage(null);

    if (draggedLead && draggedLead.status !== newStatus) {
      await updateLeadStatus(draggedLead.id, newStatus);
    }
    setDraggedLead(null);
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.status === stageId);
  };

  const getLeadBadgeColor = (score: number) => {
    if (score >= 61) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 31) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getLeadCategory = (score: number) => {
    if (score >= 61) return '🔴 Hot';
    if (score >= 31) return '🟡 Warm';
    return '🔵 Cold';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          return (
            <div key={stage.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <p className="text-xs font-medium text-gray-600">{stage.name}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stageLeads.length}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          const isHovered = hoveredStage === stage.id;

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg transition-all ${
                isHovered ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className={`${stage.color} text-white px-4 py-3 rounded-t-lg`}>
                <h3 className="font-semibold text-sm">{stage.name}</h3>
                <p className="text-xs opacity-90">{stageLeads.length} leads</p>
              </div>

              {/* Leads List */}
              <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all ${
                        draggedLead?.id === lead.id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Lead Score Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getLeadBadgeColor(lead.score)}`}>
                          {getLeadCategory(lead.score)}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          Score: {lead.score}
                        </span>
                      </div>

                      {/* Lead Info */}
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {lead.name}
                      </h4>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-blue-600 font-medium">{lead.source}</span>
                        </div>
                        {lead.message && (
                          <div className="flex items-start gap-2 mt-2">
                            <MessageSquare className="w-3 h-3 mt-0.5" />
                            <span className="line-clamp-2 italic text-gray-500">
                              {lead.message}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => {
            setSelectedLeadId(null);
            fetchLeads(); // Refresh leads after closing
          }}
        />
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Drag and drop leads between columns to update their status. Click on a lead card to view details and add notes.
        </p>
      </div>
    </div>
  );
}
