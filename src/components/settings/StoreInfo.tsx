import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Save } from 'lucide-react';

export default function StoreInfo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeTagline: '',
    storeDescription: '',
    storeAddress: '',
    contactPhone: '',
    contactEmail: '',
    businessHours: '',
    storeLocation: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      const settings = response.data.settings || {};

      setFormData({
        storeName: settings.storeName || '',
        storeTagline: settings.storeTagline || '',
        storeDescription: settings.storeDescription || '',
        storeAddress: settings.storeAddress || '',
        contactPhone: settings.contactPhone || '',
        contactEmail: settings.contactEmail || '',
        businessHours: settings.businessHours || '',
        storeLocation: settings.storeLocation || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save each setting individually
      const settingsToSave = Object.entries(formData);

      for (const [key, value] of settingsToSave) {
        await api.put(`/api/admin/settings/${key}`, {
          value,
          type: 'string'
        });
      }

      alert('Store information saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading store information...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Information</h2>
        <p className="text-sm text-gray-600">
          Basic information about your jewelry store
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Name
          </label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            placeholder="Jewels & Time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Tagline
          </label>
          <input
            type="text"
            name="storeTagline"
            value={formData.storeTagline}
            onChange={handleChange}
            placeholder="Premium Jewelry in Jamaica"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store Description
        </label>
        <textarea
          name="storeDescription"
          value={formData.storeDescription}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of your store..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store Address
        </label>
        <textarea
          name="storeAddress"
          value={formData.storeAddress}
          onChange={handleChange}
          rows={2}
          placeholder="123 Main Street, Kingston, Jamaica"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="text"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="+1 876 123 4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="info@jewelsandtime.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Hours
          </label>
          <input
            type="text"
            name="businessHours"
            value={formData.businessHours}
            onChange={handleChange}
            placeholder="Mon-Fri: 9am-5pm, Sat: 10am-4pm"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Location (City)
          </label>
          <input
            type="text"
            name="storeLocation"
            value={formData.storeLocation}
            onChange={handleChange}
            placeholder="Kingston"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
