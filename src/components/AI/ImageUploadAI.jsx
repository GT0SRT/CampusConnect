import React, { useRef } from 'react';
import { Image, Upload } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
console.log(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  import.meta.env.VITE_CLOUDINARY_PRESET
);

const ImageUploadAI = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef(null);

  // Cloudinary par image upload karne ka function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset',UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // File select hone par
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      const imageUrl = await uploadToCloudinary(file);
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
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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