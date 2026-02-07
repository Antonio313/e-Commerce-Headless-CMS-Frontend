import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Save, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';

export default function SocialMedia() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    whatsappNumber: '',
    tiktokUrl: '',
    pinterestUrl: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      const settings = response.data.settings || {};

      setFormData({
        facebookUrl: settings.facebookUrl || '',
        instagramUrl: settings.instagramUrl || '',
        twitterUrl: settings.twitterUrl || '',
        whatsappNumber: settings.whatsappNumber || '',
        tiktokUrl: settings.tiktokUrl || '',
        pinterestUrl: settings.pinterestUrl || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const settingsToSave = Object.entries(formData);

      for (const [key, value] of settingsToSave) {
        await api.put(`/api/admin/settings/${key}`, {
          value,
          type: 'string'
        });
      }

      alert('Social media links saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading social media settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Links</h2>
        <p className="text-sm text-gray-600">
          Connect your social media accounts to engage with customers
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Facebook className="w-4 h-4 text-blue-600" />
            Facebook
          </label>
          <input
            type="text"
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={handleChange}
            placeholder="https://facebook.com/yourpage"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Instagram className="w-4 h-4 text-pink-600" />
            Instagram
          </label>
          <input
            type="text"
            name="instagramUrl"
            value={formData.instagramUrl}
            onChange={handleChange}
            placeholder="https://instagram.com/yourpage"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Twitter className="w-4 h-4 text-sky-500" />
            Twitter / X
          </label>
          <input
            type="text"
            name="twitterUrl"
            value={formData.twitterUrl}
            onChange={handleChange}
            placeholder="https://twitter.com/yourpage"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <MessageCircle className="w-4 h-4 text-green-600" />
            WhatsApp Business Number
          </label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            placeholder="+1 876 123 4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code (e.g., +1 876 for Jamaica)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TikTok
          </label>
          <input
            type="text"
            name="tiktokUrl"
            value={formData.tiktokUrl}
            onChange={handleChange}
            placeholder="https://tiktok.com/@yourpage"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pinterest
          </label>
          <input
            type="text"
            name="pinterestUrl"
            value={formData.pinterestUrl}
            onChange={handleChange}
            placeholder="https://pinterest.com/yourpage"
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
