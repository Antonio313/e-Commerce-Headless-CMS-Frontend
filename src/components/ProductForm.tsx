import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Sparkles, GripVertical } from 'lucide-react';
import api from '../lib/api';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showSEOSection, setShowSEOSection] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!product?.slug);
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    comparePrice: product?.comparePrice || '',
    brandId: product?.brand?.id || '',
    categoryId: product?.category?.id || '',
    subcategoryId: product?.subcategory?.id || '',
    metalType: product?.metalType || '',
    metalPurity: product?.metalPurity || '',
    gemstone: product?.gemstone || '',
    gemstoneWeight: product?.gemstoneWeight || '',
    weight: product?.weight || '',
    dimensions: product?.dimensions || '',
    ringSize: product?.ringSize || '',
    stockQuantity: product?.stockQuantity || '',
    status: product?.status || 'DRAFT',
    featured: product?.featured || false,
    inStock: product?.inStock !== undefined ? product.inStock : true,
    publishedAt: product?.publishedAt ? new Date(product.publishedAt) : null,
    // SEO fields
    slug: product?.slug || '',
    metaTitle: product?.metaTitle || '',
    metaDesc: product?.metaDesc || '',
    keywords: product?.keywords?.join(', ') || '',
    tagIds: product?.tagIds || [],
  });

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  // Reset form when product prop changes
  useEffect(() => {
    setFormData({
      sku: product?.sku || '',
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      comparePrice: product?.comparePrice || '',
      brandId: product?.brand?.id || '',
      categoryId: product?.category?.id || '',
      subcategoryId: product?.subcategory?.id || '',
      metalType: product?.metalType || '',
      metalPurity: product?.metalPurity || '',
      gemstone: product?.gemstone || '',
      gemstoneWeight: product?.gemstoneWeight || '',
      weight: product?.weight || '',
      dimensions: product?.dimensions || '',
      ringSize: product?.ringSize || '',
      stockQuantity: product?.stockQuantity || '',
      status: product?.status || 'DRAFT',
      featured: product?.featured || false,
      inStock: product?.inStock !== undefined ? product.inStock : true,
      publishedAt: null, // Always default to null (no schedule)
      slug: product?.slug || '',
      metaTitle: product?.metaTitle || '',
      metaDesc: product?.metaDesc || '',
      keywords: product?.keywords?.join(', ') || '',
      tagIds: product?.tagIds || [],
    });
    setCurrentProduct(product);
    setSelectedImages([]);
    setImagePreviews([]);
  }, [product]);

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes, tagsRes] = await Promise.all([
        api.get('/api/admin/brands'),
        api.get('/api/admin/categories'),
        api.get('/api/admin/tags'),
      ]);

      // Admin endpoints return { brands: [...] }, { categories: [...] }, { tags: [...] }
      const brandsData = brandsRes.data.brands || brandsRes.data;
      const categoriesData = categoriesRes.data.categories || categoriesRes.data;
      const tagsData = tagsRes.data.tags || tagsRes.data;

      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (error) {
      console.error('Error fetching brands/categories/tags:', error);
      setBrands([]);
      setCategories([]);
      setTags([]);
    }
  };

  const fetchProductData = async (productId: string) => {
    try {
      const response = await api.get(`/api/admin/products/${productId}`);
      setCurrentProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const handleImagesChange = () => {
    if (currentProduct?.id) {
      fetchProductData(currentProduct.id);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setSelectedImages(prev => [...prev, ...fileArray]);

    // Create preview URLs
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageReorder = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Reorder previews
    const newPreviews = Array.from(imagePreviews);
    const [reorderedPreview] = newPreviews.splice(sourceIndex, 1);
    newPreviews.splice(destIndex, 0, reorderedPreview);
    setImagePreviews(newPreviews);

    // Reorder files
    const newFiles = Array.from(selectedImages);
    const [reorderedFile] = newFiles.splice(sourceIndex, 1);
    newFiles.splice(destIndex, 0, reorderedFile);
    setSelectedImages(newFiles);
  };

  const uploadImages = async (productId: string) => {
    if (selectedImages.length === 0) return;

    const formData = new FormData();
    selectedImages.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post(`/api/admin/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const validateSKU = async (sku: string) => {
    try {
      const response = await api.get('/api/admin/products', { params: { search: sku } });
      const products = response.data.products || [];

      // If editing, exclude the current product from the check
      const duplicates = products.filter((p: any) =>
        p.sku.toLowerCase() === sku.toLowerCase() &&
        (!product || p.id !== product.id)
      );

      return duplicates.length === 0;
    } catch (error) {
      console.error('Error validating SKU:', error);
      return true; // Allow if validation fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert keywords string to array
    const keywordsArray = formData.keywords
      ? formData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k)
      : undefined;

    const submitData = {
      ...formData,
      price: parseFloat(formData.price as string),
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice as string) : undefined,
      gemstoneWeight: formData.gemstoneWeight ? parseFloat(formData.gemstoneWeight as string) : undefined,
      weight: formData.weight ? parseFloat(formData.weight as string) : undefined,
      stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity as string) : undefined,
      subcategoryId: formData.subcategoryId || undefined, // Convert empty string to undefined
      dimensions: formData.dimensions || undefined, // Convert empty string to undefined
      ringSize: formData.ringSize || undefined, // Convert empty string to undefined
      // SEO fields
      slug: formData.slug || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDesc: formData.metaDesc || undefined,
      keywords: keywordsArray,
    };

    try {
      // Validate SKU for duplicates
      const isUniqueSKU = await validateSKU(formData.sku);
      if (!isUniqueSKU) {
        alert('This SKU already exists. Please use a unique SKU.');
        setLoading(false);
        return;
      }

      console.log('Submit data being sent:', submitData);

      if (product) {
        await api.put(`/api/admin/products/${product.id}`, submitData);
        onSuccess();
        onClose();
      } else {
        const response = await api.post('/api/admin/products', submitData);
        const newProduct = response.data.product;

        // Upload images if any were selected
        if (selectedImages.length > 0) {
          await uploadImages(newProduct.id);
        }

        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Validation details:', error.response?.data?.details);
      console.error('Submit data sent:', submitData);

      // Show detailed error message
      let errorMessage = 'Failed to save product';
      if (error.response?.data?.details && error.response.data.details.length > 0) {
        errorMessage = error.response.data.details.map((d: any) => d.message).join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Track if user manually edits the slug
    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }

    // Auto-generate slug from product name (only if not manually edited)
    if (name === 'name' && !slugManuallyEdited) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Generate smart keyword suggestions based on product data
  const generateKeywordSuggestions = () => {
    const suggestions = new Set<string>();

    // Common jewelry keywords
    const baseKeywords = [
      'jewelry', 'jewellery', 'luxury', 'premium', 'handcrafted',
      'jamaica', 'caribbean', 'fine jewelry', 'designer jewelry'
    ];

    // Extract words from description (strip HTML tags first, then filter words > 3 chars)
    if (formData.description) {
      const plainText = formData.description.replace(/<[^>]*>/g, ' ');
      const words = plainText
        .toLowerCase()
        .split(/\s+/)
        .filter((word: string) => word.length > 3 && !/^\d+$/.test(word) && !/^&\w+;$/.test(word));
      words.forEach((word: string) => suggestions.add(word));
    }

    // Add category-specific keywords
    const category = categories.find(c => c.id === formData.categoryId);
    if (category) {
      suggestions.add(category.name.toLowerCase());
      if (category.name.toLowerCase().includes('ring')) {
        suggestions.add('engagement ring');
        suggestions.add('wedding ring');
        suggestions.add('rings');
      }
      if (category.name.toLowerCase().includes('necklace')) {
        suggestions.add('necklaces');
        suggestions.add('pendant');
      }
      if (category.name.toLowerCase().includes('earring')) {
        suggestions.add('earrings');
        suggestions.add('studs');
      }
      if (category.name.toLowerCase().includes('bracelet')) {
        suggestions.add('bracelets');
        suggestions.add('bangle');
      }
    }

    // Add brand name
    const brand = brands.find(b => b.id === formData.brandId);
    if (brand) {
      suggestions.add(brand.name.toLowerCase());
    }

    // Add metal type keywords
    if (formData.metalType) {
      suggestions.add(formData.metalType.toLowerCase());
      if (formData.metalPurity) {
        suggestions.add(`${formData.metalPurity} ${formData.metalType}`.toLowerCase());
      }
    }

    // Add gemstone keywords
    if (formData.gemstone) {
      const gemstone = formData.gemstone.toLowerCase();
      suggestions.add(gemstone);
      suggestions.add(`${gemstone} jewelry`);

      // Special gemstone keywords
      if (gemstone.includes('diamond')) {
        suggestions.add('diamond ring');
        suggestions.add('diamonds');
      }
    }

    // Add base keywords
    baseKeywords.forEach(keyword => suggestions.add(keyword));

    // Filter out already used keywords
    const existingKeywords = formData.keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter((k: string) => k);
    const filteredSuggestions = Array.from(suggestions)
      .filter((s: string) => !existingKeywords.includes(s))
      .slice(0, 15); // Limit to 15 suggestions

    setKeywordSuggestions(filteredSuggestions);
  };

  // Add a keyword from suggestions
  const addKeywordFromSuggestion = (keyword: string) => {
    const currentKeywords = formData.keywords ? formData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k) : [];
    if (!currentKeywords.includes(keyword)) {
      const newKeywords = [...currentKeywords, keyword].join(', ');
      setFormData(prev => ({ ...prev, keywords: newKeywords }));
      setKeywordSuggestions(prev => prev.filter((k: string) => k !== keyword));
    }
  };

  const selectedCategory = Array.isArray(categories)
    ? categories.find((c: any) => c.id === formData.categoryId)
    : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-lg sm:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Enter product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare at Price (USD)
                </label>
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category & Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category & Brand</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategoryId"
                  value={formData.subcategoryId}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Subcategory</option>
                  {selectedCategory?.subcategories?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select tags to help customers discover this product through filtering and search.
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags available. Create tags first in the Tags management page.</p>
              ) : (
                tags.map((tag: any) => {
                  const isSelected = formData.tagIds.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newTagIds = e.target.checked
                            ? [...formData.tagIds, tag.id]
                            : formData.tagIds.filter((id: string) => id !== tag.id);
                          setFormData(prev => ({ ...prev, tagIds: newTagIds }));
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium">{tag.name}</span>
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Selected: {formData.tagIds.length} tag{formData.tagIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Jewelry Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jewelry Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal Type
                </label>
                <input
                  type="text"
                  name="metalType"
                  value={formData.metalType}
                  onChange={handleChange}
                  placeholder="e.g., Gold, Silver, Platinum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal Purity
                </label>
                <input
                  type="text"
                  name="metalPurity"
                  value={formData.metalPurity}
                  onChange={handleChange}
                  placeholder="e.g., 14K, 18K, 24K"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemstone
                </label>
                <input
                  type="text"
                  name="gemstone"
                  value={formData.gemstone}
                  onChange={handleChange}
                  placeholder="e.g., Diamond, Ruby, Sapphire"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemstone Weight (carats)
                </label>
                <input
                  type="number"
                  name="gemstoneWeight"
                  value={formData.gemstoneWeight}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (grams)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 10mm x 8mm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ring Size
                </label>
                <input
                  type="text"
                  name="ringSize"
                  value={formData.ringSize}
                  onChange={handleChange}
                  placeholder="e.g., 7, 8, 9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Inventory & Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Publish Date (Optional)
                </label>
                <DatePicker
                  selected={formData.publishedAt}
                  onChange={(date: Date | null) => setFormData(prev => ({ ...prev, publishedAt: date }))}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select publish date/time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minDate={new Date()}
                  isClearable
                />
                <p className="text-xs text-gray-500 mt-1">
                  Product will only show on frontend after this date/time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  In Stock
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>

            {currentProduct?.id ? (
              <ImageUpload
                productId={currentProduct.id}
                images={currentProduct.images || []}
                onImagesChange={handleImagesChange}
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Select images to upload (up to 10)
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Images will be uploaded automatically when you create the product
                  </p>
                </div>

                {/* Image Previews with Drag & Drop */}
                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <GripVertical className="w-4 h-4" />
                      Drag to reorder images (first image will be the primary)
                    </p>
                    <DragDropContext onDragEnd={handleImageReorder}>
                      <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          >
                            {imagePreviews.map((preview, index) => (
                              <Draggable key={`image-${index}`} draggableId={`image-${index}`} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                                      snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                                    }`}
                                  >
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                      {index === 0 && (
                                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                          Primary
                                        </span>
                                      )}
                                      <div className="flex-1"></div>
                                      <GripVertical className="w-5 h-5 text-white bg-black bg-opacity-50 rounded p-0.5 cursor-grab active:cursor-grabbing" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeSelectedImage(index)}
                                      className="absolute bottom-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No images selected yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEO Optimization */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">SEO Optimization</h3>
              <button
                type="button"
                onClick={() => setShowSEOSection(!showSEOSection)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {showSEOSection ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide SEO Fields
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show SEO Fields
                  </>
                )}
              </button>
            </div>

            {showSEOSection && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> If these fields are left empty, the system will use default SEO templates
                    configured in Settings with product data placeholders.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated-from-product-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from product name. URL-friendly identifier for this product.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="Custom page title for search engines"
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaTitle.length}/60 characters. Appears in search results and browser tabs.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDesc"
                    value={formData.metaDesc}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description of this product for search engines"
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metaDesc.length}/160 characters. Appears in search results below the title.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Keywords
                    </label>
                    {(formData.description || formData.categoryId || formData.brandId || formData.metalType || formData.gemstone) && (
                      <button
                        type="button"
                        onClick={generateKeywordSuggestions}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate Suggestions
                      </button>
                    )}
                  </div>
                  <textarea
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    rows={2}
                    placeholder="luxury jewelry, diamond ring, engagement ring (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated keywords to help search engines understand this product.
                  </p>

                  {/* Keyword Suggestions */}
                  {keywordSuggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Suggested Keywords (click to add):</p>
                      <div className="flex flex-wrap gap-2">
                        {keywordSuggestions.map((keyword, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addKeywordFromSuggestion(keyword)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-300 text-blue-700 rounded-full text-xs hover:bg-blue-50 hover:border-blue-400 transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
