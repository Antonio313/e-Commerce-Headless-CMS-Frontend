import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Tags as TagsIcon, Edit, Trash2, Plus } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  featured: boolean;
  productCount?: number;
}

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    featured: false
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/admin/tags');
      const tagsData = response.data.tags || response.data;
      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    setEditingTag(null);
    setFormData({ name: '', description: '', color: '#3B82F6', featured: false });
    setShowForm(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#3B82F6',
      featured: tag.featured
    });
    setShowForm(true);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This may affect associated products.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/tags/${tagId}`);
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      alert(error.response?.data?.message || 'Failed to delete tag');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTag) {
        await api.put(`/api/admin/tags/${editingTag.id}`, formData);
      } else {
        await api.post('/api/admin/tags', formData);
      }
      setShowForm(false);
      fetchTags();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      alert(error.response?.data?.message || 'Failed to save tag');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading && tags.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-1">{tags.length} total tags</p>
        </div>
        <button
          onClick={handleAddTag}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: tag.color ? `${tag.color}20` : '#3B82F620' }}
                >
                  <TagsIcon className="w-6 h-6" style={{ color: tag.color || '#3B82F6' }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tag.name}</h3>
                  {tag.productCount !== undefined && (
                    <p className="text-sm text-gray-500">{tag.productCount} products</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTag(tag)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit tag"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete tag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {tag.description && (
              <p className="text-sm text-gray-600 mb-3">{tag.description}</p>
            )}

            {/* Tag Preview */}
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: tag.color || '#3B82F6' }}
              >
                {tag.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TagsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tags yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first tag</p>
          <button
            onClick={handleAddTag}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Your First Tag
          </button>
        </div>
      )}

      {/* Tag Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Luxury, New Arrival, Trending"
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
                  placeholder="Brief description of the tag..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for displaying tags on product cards</p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Tag</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Display this tag prominently on the frontend</p>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: formData.color || '#3B82F6' }}
                >
                  {formData.name || 'Tag Name'}
                </span>
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
                  {loading ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
