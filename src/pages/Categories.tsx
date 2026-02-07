import { useEffect, useState } from 'react';
import api from '../lib/api';
import { FolderTree, Edit, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories: Subcategory[];
  productCount?: number;
  expanded?: boolean;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'category' | 'subcategory'>('category');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories');
      // Admin endpoint returns { categories: [...] }
      const categoriesData = response.data.categories || response.data;
      const cats = Array.isArray(categoriesData) ? categoriesData : [];
      // Add expanded property to each category
      setCategories(cats.map((cat: Category) => ({ ...cat, expanded: true })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const handleAddCategory = () => {
    setFormType('category');
    setEditingItem(null);
    setParentCategoryId('');
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleAddSubcategory = (categoryId: string) => {
    setFormType('subcategory');
    setEditingItem(null);
    setParentCategoryId(categoryId);
    setFormData({ name: '', description: '' });
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormType('category');
    setEditingItem(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowForm(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory, categoryId: string) => {
    setFormType('subcategory');
    setEditingItem(subcategory);
    setParentCategoryId(categoryId);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
    });
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;

    if (hasSubcategories) {
      alert('Cannot delete category with subcategories. Please delete subcategories first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this category? This may affect associated products.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/categories/${categoryId}`);
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory? This may affect associated products.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`);
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      alert(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formType === 'category') {
        if (editingItem) {
          await api.put(`/api/admin/categories/${editingItem.id}`, formData);
        } else {
          await api.post('/api/admin/categories', formData);
        }
      } else {
        if (editingItem) {
          await api.put(`/api/admin/categories/${parentCategoryId}/subcategories/${editingItem.id}`, formData);
        } else {
          await api.post(`/api/admin/categories/${parentCategoryId}/subcategories`, formData);
        }
      }
      setShowForm(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(error.response?.data?.message || 'Failed to save');
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

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Tree */}
      <div className="bg-white rounded-lg shadow">
        {categories.map((category) => (
          <div key={category.id} className="border-b last:border-b-0">
            {/* Category Row */}
            <div className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {category.expanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <FolderTree className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {category.subcategories?.length || 0} subcategories
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddSubcategory(category.id)}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Add Subcategory
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit category"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {category.expanded && category.subcategories && category.subcategories.length > 0 && (
              <div className="bg-gray-50 border-t">
                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center justify-between p-4 pl-16 hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{subcategory.name}</h4>
                      {subcategory.description && (
                        <p className="text-sm text-gray-500">{subcategory.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSubcategory(subcategory, category.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit subcategory"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first category</p>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Your First Category
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem
                  ? `Edit ${formType === 'category' ? 'Category' : 'Subcategory'}`
                  : `Add New ${formType === 'category' ? 'Category' : 'Subcategory'}`
                }
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${formType === 'category' ? 'Rings, Necklaces' : 'Engagement Rings, Tennis Bracelets'}`}
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
                  placeholder="Brief description..."
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
                  {loading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
