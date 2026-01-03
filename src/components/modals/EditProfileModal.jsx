import { useState } from "react";
import { updateUserProfile } from "../../services/userService";

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    campus: user.campus || "",
    batch: user.batch || "",
    branch: user.branch || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profile_pic);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show local preview
    }
  };

  const uploadToCloudinary = async () => {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET); // Secure env var
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data,
    });
    const fileData = await res.json();
    return fileData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profile_pic = user.profile_pic;

      // 1. Upload Image to Cloudinary if a new one was selected
      if (imageFile) {
        profile_pic = await uploadToCloudinary();
      }

      // 2. Prepare data for Firebase (excluding stats like karma)
      const updatedData = {
        ...formData,
        profile_pic,
      };

      // 3. Update Firebase
      await updateUserProfile(user.uid, updatedData);
      
      // 4. Update parent state and close
      onUpdate(updatedData); 
      onClose();
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-2">
            <img src={previewUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
          <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="campus" placeholder="Campus" value={formData.campus} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="batch" placeholder="Batch (e.g., 2024)" value={formData.batch} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} className="w-full border p-2 rounded" />

          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}