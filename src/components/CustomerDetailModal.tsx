import { useEffect, useState } from 'react';
import api, { API_URL } from '../lib/api';
import { X, Mail, Phone, Calendar, ShoppingBag, Award } from 'lucide-react';

interface CustomerDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    name: string;
    price: number;
    slug: string;
    images?: { url: string; isPrimary?: boolean }[];
    brand?: { name: string };
  } | null;
}

interface Collection {
  id: string;
  name: string;
  items: WishlistItem[];
  totalValue: number;
  itemCount: number;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  score: number;
  category: string;
  source: string;
  createdAt: string;
  wishlistId?: string;
}

interface Props {
  customerId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CustomerDetailModal({ customerId, onClose, onUpdate }: Props) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [wishlists, setWishlists] = useState<Collection[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/api/admin/customers/${customerId}`);
        setCustomer(response.data.customer);
        setWishlists(response.data.wishlists);
        setLeads(response.data.leads);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleToggleActive = async () => {
    if (!customer) return;
    setToggling(true);
    try {
      await api.put(`/api/admin/customers/${customerId}`, {
        isActive: !customer.isActive
      });
      setCustomer(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      onUpdate();
    } catch (error) {
      console.error('Error toggling customer:', error);
    } finally {
      setToggling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-purple-100 text-purple-800';
      case 'SCHEDULED': return 'bg-indigo-100 text-indigo-800';
      case 'CONVERTED': return 'bg-green-100 text-green-800';
      case 'LOST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (product: WishlistItem['product']) => {
    if (!product?.images?.length) return null;
    const primary = product.images.find(img => img.isPrimary) || product.images[0];
    const url = primary.url;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center p-4 pt-8 sm:pt-16">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : customer ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Profile */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                  {customer.lastLoginAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Last login {new Date(customer.lastLoginAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Toggle Active */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${customer.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleActive}
                    disabled={toggling}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      customer.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:opacity-50`}
                  >
                    {toggling ? '...' : customer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>

                {/* Jewelry Box / Collections */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Collections ({wishlists.length})
                  </h3>
                  {wishlists.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No collections yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {wishlists.map((collection) => (
                        <div key={collection.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{collection.name || 'Collection'}</p>
                            <div className="text-xs text-gray-500">
                              {collection.itemCount} items &middot; ${collection.totalValue?.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {collection.items.slice(0, 5).map((item) => {
                              if (!item.product) return null;
                              const imgUrl = getImageUrl(item.product);
                              return (
                                <div key={item.id} className="shrink-0 w-12 h-12">
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={item.product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                      N/A
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {collection.itemCount > 5 && (
                              <div className="shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                                +{collection.itemCount - 5}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(collection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lead History */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Lead History ({leads.length})
                  </h3>
                  {leads.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No leads yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {leads.map((lead) => (
                        <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                              <span className="text-xs text-gray-500">{lead.source}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{lead.score}</p>
                            <p className="text-xs text-gray-500">{lead.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-500">Customer not found.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
