import { useState } from 'react';
import { X, Upload, Image as ImageIcon, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api, { API_URL } from '../lib/api';

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ImageUploadProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: () => void;
}

export default function ImageUpload({ productId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      await api.post(`/api/admin/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      onImagesChange();
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/products/${productId}/images/${imageId}`);
      onImagesChange();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      alert(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleImageReorder = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Create a copy of the sorted images array
    const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

    // Reorder the array
    const [movedImage] = sortedImages.splice(sourceIndex, 1);
    sortedImages.splice(destIndex, 0, movedImage);

    // Update sortOrder for all images
    const updates = sortedImages.map((image, index) => ({
      imageId: image.id,
      sortOrder: index,
      isPrimary: index === 0 // First image becomes primary
    }));

    try {
      // Update the order on the server
      await api.put(`/api/admin/products/${productId}/images/reorder`, { updates });
      onImagesChange();
    } catch (error: any) {
      console.error('Error reordering images:', error);
      alert(error.response?.data?.message || 'Failed to reorder images');
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>

        {/* Upload Button */}
        <div className="mb-4">
          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {uploading ? `Uploading... ${uploadProgress}%` : 'Click to upload images'}
              </span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Upload up to 10 images. First image will be the primary image.
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Image Grid with Drag & Drop */}
        {images && images.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              Drag to reorder images (first image will be the primary)
            </p>
            <DragDropContext onDragEnd={handleImageReorder}>
              <Droppable droppableId="product-images" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {images
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((image, index) => (
                        <Draggable key={image.id} draggableId={image.id} index={index}>
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
                                src={getImageUrl(image.url)}
                                alt="Product"
                                className="w-full h-full object-cover"
                              />

                              {/* Primary Badge and Drag Handle */}
                              <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                {image.isPrimary && (
                                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                    Primary
                                  </span>
                                )}
                                <div className="flex-1"></div>
                                <GripVertical className="w-5 h-5 text-white bg-black bg-opacity-50 rounded p-0.5 cursor-grab active:cursor-grabbing" />
                              </div>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.id)}
                                className="absolute bottom-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                title="Delete image"
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
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No images uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
