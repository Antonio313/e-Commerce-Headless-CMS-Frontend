import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Heart, Mail, Calendar, DollarSign, Eye, Trash2, ExternalLink, Copy, Check } from 'lucide-react';

interface WishlistItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    images: any[];
    brand?: { name: string };
  };
  notes?: string;
  addedAt: string;
}

interface Wishlist {
  id: string;
  name: string;
  email?: string;
  shareToken: string;
  items: WishlistItem[];
  lead?: {
    id: string;
    name: string;
    status: string;
    score: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Wishlists() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      const response = await api.get('/api/admin/wishlists');
      setWishlists(response.data.wishlists || response.data || []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWishlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      await api.delete(`/api/admin/wishlists/${id}`);
      setWishlists(wishlists.filter(w => w.id !== id));
      if (selectedWishlist?.id === id) {
        setSelectedWishlist(null);
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      alert('Failed to delete wishlist');
    }
  };

  const copyShareLink = (shareToken: string) => {
    const link = `${window.location.origin}/wishlist/${shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(shareToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getTotalValue = (items: WishlistItem[]) => {
    return items.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  };

  const getLeadBadgeColor = (score: number) => {
    if (score >= 61) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 31) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getLeadCategory = (score: number) => {
    if (score >= 61) return 'Hot Lead';
    if (score >= 31) return 'Warm Lead';
    return 'Cold Lead';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading wishlists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wishlists</h1>
        <p className="text-gray-600 mt-1">{wishlists.length} total wishlists</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Wishlists</p>
              <p className="text-2xl font-bold text-gray-900">{wishlists.length}</p>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {wishlists.filter(w => w.lead).length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {wishlists.length > 0
                  ? Math.round(wishlists.reduce((sum, w) => sum + w.items.length, 0) / wishlists.length)
                  : 0}
              </p>
            </div>
            <Heart className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${wishlists.reduce((sum, w) => sum + getTotalValue(w.items), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wishlists List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">All Wishlists</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {wishlists.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No wishlists yet</p>
              </div>
            ) : (
              wishlists.map((wishlist) => (
                <div
                  key={wishlist.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedWishlist?.id === wishlist.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedWishlist(wishlist)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{wishlist.name}</h3>
                      {wishlist.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {wishlist.email}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{wishlist.items.length} items</span>
                        <span className="font-medium text-green-600">
                          ${getTotalValue(wishlist.items).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(wishlist.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {wishlist.lead && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getLeadBadgeColor(wishlist.lead.score)}`}>
                            {getLeadCategory(wishlist.lead.score)} (Score: {wishlist.lead.score})
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWishlist(wishlist.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wishlist Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedWishlist ? 'Wishlist Details' : 'Select a Wishlist'}
            </h2>
          </div>
          <div className="p-6">
            {!selectedWishlist ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a wishlist to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Wishlist Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{selectedWishlist.name}</h3>
                  <div className="space-y-2 text-sm">
                    {selectedWishlist.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{selectedWishlist.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created {new Date(selectedWishlist.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-green-600">
                        Total Value: ${getTotalValue(selectedWishlist.items).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Link */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/wishlist/${selectedWishlist.shareToken}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <button
                      onClick={() => copyShareLink(selectedWishlist.shareToken)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                      {copiedToken === selectedWishlist.shareToken ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <a
                      href={`/wishlist/${selectedWishlist.shareToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Associated Lead */}
                {selectedWishlist.lead && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Associated Lead</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <strong>Name:</strong> {selectedWishlist.lead.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Status:</strong> {selectedWishlist.lead.status}
                      </p>
                      <p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getLeadBadgeColor(selectedWishlist.lead.score)}`}>
                          {getLeadCategory(selectedWishlist.lead.score)} (Score: {selectedWishlist.lead.score})
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Wishlist Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Products ({selectedWishlist.items.length})
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedWishlist.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Heart className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">
                            {item.product?.name || 'Unknown Product'}
                          </h5>
                          {item.product?.brand && (
                            <p className="text-xs text-gray-500">{item.product.brand.name}</p>
                          )}
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            ${item.product?.price.toLocaleString() || 0}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic">Note: {item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
