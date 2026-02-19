import React, { useRef } from 'react';
import { Image, Upload } from 'lucide-react';
import { uploadImageToCloudinary, validateImageFile } from '../../services/cloudinaryService';

const ImageUploadAI = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef(null);

  // File select hone par
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      onImageUpload(imageUrl);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    }

    // Clear input
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Upload className="w-5 h-5 animate-bounce" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Image className="w-5 h-5" />
            <span>Upload Image for Caption</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        Supported: JPG, PNG, GIF (Max 10MB)
      </p>
    </div>
  );
};

export default ImageUploadAI;