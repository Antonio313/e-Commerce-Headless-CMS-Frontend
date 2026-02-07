import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Package, DollarSign, Tag, Edit, Trash2, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Link as LinkIcon, Copy, Upload, CheckSquare, Square } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import ProductRelationshipsModal from '../components/ProductRelationshipsModal';
import BulkUploadModal from '../components/BulkUploadModal';

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  brand: { name: string };
  category: { name: string };
  status: string;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allFilteredProducts, setAllFilteredProducts] = useState<Product[]>([]); // Track all filtered products for stats
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showRelationshipsModal, setShowRelationshipsModal] = useState(false);
  const [relationshipsProduct, setRelationshipsProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filter, searchQuery, brandFilter, categoryFilter, minPrice, maxPrice, sortBy, sortOrder, currentPage]);

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        api.get('/api/admin/brands'),
        api.get('/api/admin/categories'),
      ]);
      const brandsData = brandsRes.data.brands || brandsRes.data;
      const categoriesData = categoriesRes.data.categories || categoriesRes.data;
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching brands/categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = { limit: 200 }; // Fetch more for client-side pagination
      if (filter !== 'all') {
        params.status = filter.toUpperCase();
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (brandFilter) {
        params.brandId = brandFilter;
      }
      if (categoryFilter) {
        params.categoryId = categoryFilter;
      }

      const response = await api.get('/api/admin/products', { params });
      let filteredProducts = response.data.products;

      // Apply client-side price filtering
      if (minPrice || maxPrice) {
        filteredProducts = filteredProducts.filter((p: Product) => {
          const price = p.price;
          const min = minPrice ? parseFloat(minPrice) : 0;
          const max = maxPrice ? parseFloat(maxPrice) : Infinity;
          return price >= min && price <= max;
        });
      }

      // Apply sorting
      filteredProducts.sort((a: Product, b: Product) => {
        let aVal: any = a[sortBy as keyof Product];
        let bVal: any = b[sortBy as keyof Product];

        // Handle nested properties (brand.name, category.name)
        if (sortBy === 'brand') {
          aVal = a.brand?.name || '';
          bVal = b.brand?.name || '';
        } else if (sortBy === 'category') {
          aVal = a.category?.name || '';
          bVal = b.category?.name || '';
        }

        if (typeof aVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });

      // Store all filtered products for statistics
      setAllFilteredProducts(filteredProducts);

      // Calculate pagination
      const total = Math.ceil(filteredProducts.length / itemsPerPage);
      setTotalPages(total);

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

      setProducts(paginatedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/products/${productId}`);
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const handleDuplicateProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to duplicate "${product.name}"?`)) {
      return;
    }

    try {
      const { id, ...productWithoutId } = product;
      const duplicateData = {
        ...productWithoutId,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY-${Date.now()}`,
        status: 'DRAFT',
      };

      await api.post('/api/admin/products', duplicateData);
      fetchProducts();
      alert('Product duplicated successfully');
    } catch (error: any) {
      console.error('Error duplicating product:', error);
      alert(error.response?.data?.message || 'Failed to duplicate product');
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkPublish = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Publish ${selectedProducts.length} selected product(s)?`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id =>
          api.put(`/api/admin/products/${id}`, { status: 'PUBLISHED' })
        )
      );
      fetchProducts();
      setSelectedProducts([]);
      alert(`${selectedProducts.length} product(s) published successfully`);
    } catch (error: any) {
      console.error('Error publishing products:', error);
      alert('Failed to publish some products');
    }
  };

  const handleBulkDraft = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Move ${selectedProducts.length} selected product(s) to draft?`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id =>
          api.put(`/api/admin/products/${id}`, { status: 'DRAFT' })
        )
      );
      fetchProducts();
      setSelectedProducts([]);
      alert(`${selectedProducts.length} product(s) moved to draft successfully`);
    } catch (error: any) {
      console.error('Error updating products:', error);
      alert('Failed to update some products');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Delete ${selectedProducts.length} selected product(s)? This action cannot be undone.`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id =>
          api.delete(`/api/admin/products/${id}`)
        )
      );
      fetchProducts();
      setSelectedProducts([]);
      alert(`${selectedProducts.length} product(s) deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting products:', error);
      alert('Failed to delete some products');
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5001${url}`;
  };

  const getPrimaryImage = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    return product.images.find(img => img.isPrimary) || product.images[0];
  };

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === column && (
          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  const stats = {
    total: allFilteredProducts.length,
    published: allFilteredProducts.filter(p => p.status === 'PUBLISHED').length,
    draft: allFilteredProducts.filter(p => p.status === 'DRAFT').length,
    featured: allFilteredProducts.filter(p => p.featured).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            {stats.total} total products
            {selectedProducts.length > 0 && (
              <span className="ml-2 text-blue-600 font-semibold">
                ({selectedProducts.length} selected)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkPublish}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Publish
              </button>
              <button
                onClick={handleBulkDraft}
                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
              >
                Move to Draft
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </div>
            <Tag className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
            </div>
            <Tag className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
            </div>
            <Tag className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Status Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-md ${
                filter === 'published' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-md ${
                filter === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Draft
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(brandFilter || categoryFilter || minPrice || maxPrice) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setBrandFilter('');
                setCategoryFilter('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Advanced Filters
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={handleSelectAll}
                  className="p-1 hover:bg-gray-200 rounded"
                  title={selectedProducts.length === products.length ? 'Deselect all' : 'Select all'}
                >
                  {selectedProducts.length === products.length && products.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <SortableHeader column="name" label="Product" />
              <SortableHeader column="brand" label="Brand" />
              <SortableHeader column="category" label="Category" />
              <SortableHeader column="price" label="Price" />
              <SortableHeader column="status" label="Status" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const primaryImage = getPrimaryImage(product);
              const isSelected = selectedProducts.includes(product.id);
              return (
                <tr key={product.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleSelectProduct(product.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={getImageUrl(primaryImage.url)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </div>
                  </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.brand?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.category?.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm font-semibold text-gray-900">
                    <DollarSign className="w-4 h-4" />
                    {product.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setRelationshipsProduct(product);
                        setShowRelationshipsModal(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                      title="Manage product relationships"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateProduct(product)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Duplicate product"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Product Relationships Modal */}
      {showRelationshipsModal && relationshipsProduct && (
        <ProductRelationshipsModal
          product={relationshipsProduct}
          onClose={() => {
            setShowRelationshipsModal(false);
            setRelationshipsProduct(null);
          }}
          onSuccess={() => {
            fetchProducts(); // Refresh the products list
          }}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={() => {
            fetchProducts();
            setShowBulkUploadModal(false);
          }}
        />
      )}
    </div>
  );
}
