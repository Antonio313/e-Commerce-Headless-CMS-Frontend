import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Save, Mail, MessageCircle } from 'lucide-react';

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    leadNotificationEmail: '',
    leadNotificationWhatsapp: '',
    enableEmailNotifications: true,
    enableWhatsappNotifications: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      const settings = response.data.settings || {};

      setFormData({
        leadNotificationEmail: settings.leadNotificationEmail || '',
        leadNotificationWhatsapp: settings.leadNotificationWhatsapp || '',
        enableEmailNotifications: settings.enableEmailNotifications !== false,
        enableWhatsappNotifications: settings.enableWhatsappNotifications !== false,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/api/admin/settings/leadNotificationEmail', {
        value: formData.leadNotificationEmail,
        type: 'string'
      });

      await api.put('/api/admin/settings/leadNotificationWhatsapp', {
        value: formData.leadNotificationWhatsapp,
        type: 'string'
      });

      await api.put('/api/admin/settings/enableEmailNotifications', {
        value: formData.enableEmailNotifications,
        type: 'boolean'
      });

      await api.put('/api/admin/settings/enableWhatsappNotifications', {
        value: formData.enableWhatsappNotifications,
        type: 'boolean'
      });

      alert('Notification settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading notification settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Notifications</h2>
        <p className="text-sm text-gray-600">
          Configure how you want to be notified when new leads are generated
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Email Notifications</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enableEmailNotifications"
                    checked={formData.enableEmailNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable email notifications
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    name="leadNotificationEmail"
                    value={formData.leadNotificationEmail}
                    onChange={handleChange}
                    disabled={!formData.enableEmailNotifications}
                    placeholder="admin@jewelsandtime.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    New lead notifications will be sent to this email
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">WhatsApp Notifications</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enableWhatsappNotifications"
                    checked={formData.enableWhatsappNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable WhatsApp notifications
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    name="leadNotificationWhatsapp"
                    value={formData.leadNotificationWhatsapp}
                    onChange={handleChange}
                    disabled={!formData.enableWhatsappNotifications}
                    placeholder="+1 876 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 876 for Jamaica). New lead alerts will be sent to this number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
