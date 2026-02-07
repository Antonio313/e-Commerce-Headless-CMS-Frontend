import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Save, Info } from 'lucide-react';

export default function SEODefaults() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    defaultMetaTitleTemplate: '',
    defaultMetaDescriptionTemplate: '',
    defaultKeywords: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings');
      const settings = response.data.settings || {};

      setFormData({
        defaultMetaTitleTemplate: settings.defaultMetaTitleTemplate || '',
        defaultMetaDescriptionTemplate: settings.defaultMetaDescriptionTemplate || '',
        defaultKeywords: settings.defaultKeywords || '',
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
      const settingsToSave = Object.entries(formData);

      for (const [key, value] of settingsToSave) {
        await api.put(`/api/admin/settings/${key}`, {
          value,
          type: 'string'
        });
      }

      alert('SEO defaults saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading SEO settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Default Templates</h2>
        <p className="text-sm text-gray-600">
          These templates are used for products that don't have custom SEO fields filled in
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Available Placeholders:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-blue-100 px-1 rounded">{'{{productName}}'}</code> - Product name</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{{brand}}'}</code> - Brand name</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{{category}}'}</code> - Category name</li>
              <li><code className="bg-blue-100 px-1 rounded">{'{{price}}'}</code> - Product price</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Meta Title Template
        </label>
        <input
          type="text"
          name="defaultMetaTitleTemplate"
          value={formData.defaultMetaTitleTemplate}
          onChange={handleChange}
          placeholder="{{productName}} | Jewels & Time - Premium Jewelry in Jamaica"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Example: "Diamond Ring | Jewels & Time - Premium Jewelry in Jamaica"
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Meta Description Template
        </label>
        <textarea
          name="defaultMetaDescriptionTemplate"
          value={formData.defaultMetaDescriptionTemplate}
          onChange={handleChange}
          rows={3}
          placeholder="Shop {{productName}} by {{brand}} at Jewels & Time. Premium jewelry in Jamaica. {{category}} starting at {{price}}."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Keep it under 160 characters for best results
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Keywords (comma-separated)
        </label>
        <textarea
          name="defaultKeywords"
          value={formData.defaultKeywords}
          onChange={handleChange}
          rows={2}
          placeholder="jewelry, Jamaica, luxury jewelry, engagement rings, wedding bands, diamond rings"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          These keywords will be combined with product-specific keywords
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How it works:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>When a product page loads, the system checks if custom SEO fields are filled</li>
          <li>If custom SEO exists, it uses those values</li>
          <li>If not, it uses these default templates and replaces placeholders with actual product data</li>
          <li>This ensures all products have good SEO, even without manual input</li>
        </ol>
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
