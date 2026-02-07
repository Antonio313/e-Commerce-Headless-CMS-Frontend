import { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, TrendingUp, User, MessageSquare, Send } from 'lucide-react';
import api from '../lib/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  message?: string;
  wishlistId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  ipAddress?: string;
  userAgent?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
  convertedAt?: string;
}

interface LeadNote {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

interface LeadDetailModalProps {
  leadId: string;
  onClose: () => void;
  onUpdate?: () => void;  // Optional - LeadPipeline doesn't pass this
}

export default function LeadDetailModal({ leadId, onClose, onUpdate }: LeadDetailModalProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/api/admin/leads/${leadId}`);
      setLead(response.data.lead);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!lead) return;

    setUpdatingStatus(true);
    try {
      await api.put(`/api/admin/leads/${lead.id}`, { status: newStatus });
      setLead({ ...lead, status: newStatus });
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignmentUpdate = async (assignedTo: string) => {
    if (!lead) return;

    try {
      await api.put(`/api/admin/leads/${lead.id}`, { assignedTo: assignedTo || undefined });
      setLead({ ...lead, assignedTo: assignedTo || undefined });
      onUpdate?.();
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      alert(error.response?.data?.error || 'Failed to update assignment');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead) return;

    setSavingNote(true);
    try {
      await api.post(`/api/admin/leads/${lead.id}/notes`, {
        note: newNote.trim(),
        createdBy: 'Admin' // In production, use actual user from auth context
      });

      setNewNote('');
      fetchLeadDetails(); // Refresh to get new note
    } catch (error: any) {
      console.error('Error adding note:', error);
      alert(error.response?.data?.error || 'Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-500">Loading lead details...</div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-red-500">Lead not found</div>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
        </div>
      </div>
    );
  }

  const scoreColor = lead.score >= 61 ? 'bg-red-500' : lead.score >= 31 ? 'bg-yellow-500' : 'bg-blue-500';
  const scoreLabel = lead.score >= 61 ? '🔥 HOT LEAD' : lead.score >= 31 ? '⚡ WARM LEAD' : '❄️ COLD LEAD';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${scoreColor}`}>
                {scoreLabel} - {lead.score}/100
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                lead.status === 'CONTACTED' ? 'bg-purple-100 text-purple-800' :
                lead.status === 'QUALIFIED' ? 'bg-yellow-100 text-yellow-800' :
                lead.status === 'SCHEDULED' ? 'bg-orange-100 text-orange-800' :
                lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {lead.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                </div>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Source</div>
                  <div className="font-medium">{lead.source}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="font-medium">{new Date(lead.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap">{lead.message}</div>
            </div>
          )}

          {/* Lead Management */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Status Update */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
              <select
                value={lead.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
              <select
                value={lead.assignedTo || ''}
                onChange={(e) => handleAssignmentUpdate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                <option value="Admin">Admin</option>
                <option value="Sales Team">Sales Team</option>
                <option value="Support Team">Support Team</option>
              </select>
            </div>
          </div>

          {/* Customer Journey / Tracking Data */}
          {(lead.utmSource || lead.utmMedium || lead.utmCampaign || lead.referrer || lead.ipAddress) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Journey</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {lead.utmSource && (
                  <div>
                    <span className="text-gray-500">UTM Source:</span>
                    <span className="ml-2 font-medium">{lead.utmSource}</span>
                  </div>
                )}
                {lead.utmMedium && (
                  <div>
                    <span className="text-gray-500">UTM Medium:</span>
                    <span className="ml-2 font-medium">{lead.utmMedium}</span>
                  </div>
                )}
                {lead.utmCampaign && (
                  <div>
                    <span className="text-gray-500">UTM Campaign:</span>
                    <span className="ml-2 font-medium">{lead.utmCampaign}</span>
                  </div>
                )}
                {lead.referrer && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Referrer:</span>
                    <span className="ml-2 font-medium text-xs break-all">{lead.referrer}</span>
                  </div>
                )}
                {lead.ipAddress && (
                  <div>
                    <span className="text-gray-500">IP Address:</span>
                    <span className="ml-2 font-medium">{lead.ipAddress}</span>
                  </div>
                )}
                {lead.userAgent && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Device:</span>
                    <span className="ml-2 font-medium text-xs break-all">{lead.userAgent}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>

            {/* Add New Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal notes about this lead..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || savingNote}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {savingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No notes yet</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{note.createdBy}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{note.note}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
            <a
              href={`mailto:${lead.email}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Lead
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Lead
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
