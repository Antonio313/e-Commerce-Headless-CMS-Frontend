import { useState, useEffect } from 'react';
import { X, Search, Package, Link as LinkIcon } from 'lucide-react';
import api from '../lib/api';

interface ProductRelationshipsModalProps {
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductRelationshipsModal({ product, onClose, onSuccess }: ProductRelationshipsModalProps) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groupedProductIds, setGroupedProductIds] = useState<string[]>(product?.groupedProductIds || []);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(product?.relatedProductIds || []);

  // Search states
  const [groupedSearch, setGroupedSearch] = useState('');
  const [relatedSearch, setRelatedSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/products', {
        params: { limit: 500, status: 'PUBLISHED' }
      });
      const productsData = response.data.products || response.data || [];
      // Filter out the current product
      setAllProducts(productsData.filter((p: any) => p.id !== product.id));
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/admin/products/${product.id}`, {
        groupedProductIds: groupedProductIds.length > 0 ? groupedProductIds : undefined,
        relatedProductIds: relatedProductIds.length > 0 ? relatedProductIds : undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating product relationships:', error);
      alert('Failed to update product relationships');
    } finally {
      setSaving(false);
    }
  };

  const toggleGroupedProduct = (productId: string) => {
    setGroupedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleRelatedProduct = (productId: string) => {
    setRelatedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Filter products based on search
  const filterProducts = (products: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return products;

    const search = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search) ||
      p.brand?.name.toLowerCase().includes(search) ||
      p.category?.name.toLowerCase().includes(search)
    );
  };

  const filteredGroupedProducts = filterProducts(allProducts, groupedSearch);
  const filteredRelatedProducts = filterProducts(allProducts, relatedSearch);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Product Relationships</h2>
            <p className="text-sm text-gray-600 mt-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading products...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grouped Products Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Grouped Products (Product Set)
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Select products that form a matching set with this item. Each piece is sold separately but displayed together as a collection.
                </p>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, brand..."
                    value={groupedSearch}
                    onChange={(e) => setGroupedSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Selected Count */}
                <div className="mb-3 text-sm font-medium text-gray-700">
                  Selected: {groupedProductIds.length} products
                </div>

                {/* Products List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredGroupedProducts.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">
                      {groupedSearch ? 'No products match your search' : 'No products available'}
                    </p>
                  ) : (
                    filteredGroupedProducts.map((p: any) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          groupedProductIds.includes(p.id)
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={groupedProductIds.includes(p.id)}
                          onChange={() => toggleGroupedProduct(p.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{p.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            SKU: {p.sku} | {p.brand?.name || 'No Brand'} | ${p.price}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {p.category?.name || 'No Category'}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Related Products Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Related Products ("You May Also Like")
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Select products to recommend to customers viewing this item. Aim for at least 5 related products for better recommendations.
                </p>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, brand..."
                    value={relatedSearch}
                    onChange={(e) => setRelatedSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Selected Count with Warning */}
                <div className="mb-3">
                  <div className={`text-sm font-medium ${
                    relatedProductIds.length < 5 ? 'text-yellow-600' : 'text-gray-700'
                  }`}>
                    Selected: {relatedProductIds.length} products
                    {relatedProductIds.length < 5 && (
                      <span className="ml-2 text-xs">(Recommended: at least 5)</span>
                    )}
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredRelatedProducts.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">
                      {relatedSearch ? 'No products match your search' : 'No products available'}
                    </p>
                  ) : (
                    filteredRelatedProducts.map((p: any) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          relatedProductIds.includes(p.id)
                            ? 'bg-green-50 border-green-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={relatedProductIds.includes(p.id)}
                          onChange={() => toggleRelatedProduct(p.id)}
                          className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{p.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            SKU: {p.sku} | {p.brand?.name || 'No Brand'} | ${p.price}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {p.category?.name || 'No Category'}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {groupedProductIds.length} grouped · {relatedProductIds.length} related
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Relationships'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
