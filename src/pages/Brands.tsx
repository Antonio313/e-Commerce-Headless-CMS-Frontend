import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Tag, Edit, Trash2, Plus, Eye } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  productCount?: number;
}

export default function Brands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get('/api/admin/brands');
      // Admin endpoint returns { brands: [...] }
      const brandsData = response.data.brands || response.data;
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', website: '' });
    setShowForm(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
    });
    setShowForm(true);
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand? This may affect associated products.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/brands/${brandId}`);
      fetchBrands();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      alert(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBrand) {
        await api.put(`/api/admin/brands/${editingBrand.id}`, formData);
      } else {
        await api.post('/api/admin/brands', formData);
      }
      setShowForm(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Error saving brand:', error);
      alert(error.response?.data?.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading brands...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600 mt-1">{brands.length} total brands</p>
        </div>
        <button
          onClick={handleAddBrand}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                  {brand.productCount !== undefined && (
                    <p className="text-sm text-gray-500">{brand.productCount} products</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/products?brand=${brand.id}`)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="View products by this brand"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditBrand(brand)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit brand"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete brand"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {brand.description && (
              <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
            )}

            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Visit Website →
              </a>
            )}
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first brand</p>
          <button
            onClick={handleAddBrand}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Your First Brand
          </button>
        </div>
      )}

      {/* Brand Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rolex, Cartier, Tiffany & Co."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the brand..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="www.example.com or https://www.example.com"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
