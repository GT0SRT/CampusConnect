import { useState } from "react";
import { updateUserProfile } from "../services/userService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";

export function useEditProfileController({ user, onClose, onUpdate }) {
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

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
        setImageFile(null);
        setPreviewUrl("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) return alert("Name is required");
        if (!formData.campus.trim()) return alert("Campus is required");
        if (!formData.branch.trim()) return alert("Branch is required");
        if (!formData.batch.trim()) return alert("Batch is required");

        setLoading(true);

        try {
            let profile_pic = previewUrl;
            if (imageFile) {
                profile_pic = await uploadImageToCloudinary(imageFile);
            }

            const updatedData = { ...formData, profile_pic };
            await updateUserProfile(user.uid, updatedData);
            onUpdate(updatedData);
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        formData,
        imageFile,
        previewUrl,
        handleChange,
        handleImageChange,
        handleRemovePhoto,
        handleSubmit,
    };
}
