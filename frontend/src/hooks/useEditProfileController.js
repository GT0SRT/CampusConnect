import { useState } from "react";
import { updateUserProfile } from "../services/userService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";

export function useEditProfileController({ user, onClose, onUpdate }) {
    const existingSocialLinks = user?.socialLinks || {};
    const baseSocialKeys = new Set(["github", "linkedin", "portfolio"]);
    const initialCustomLinks = Object.entries(existingSocialLinks)
        .filter(([key, value]) => !baseSocialKeys.has(key) && String(value || "").trim())
        .map(([key, value]) => ({
            platform: key,
            url: String(value || ""),
        }));

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: user.username || "",
        name: user.name || "",
        bio: user.bio || "",
        github: existingSocialLinks.github || user.github || "",
        linkedin: existingSocialLinks.linkedin || user.linkedin || "",
        portfolio: existingSocialLinks.portfolio || user.portfolio || "",
    });
    const [customLinks, setCustomLinks] = useState(initialCustomLinks);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user.profile_pic || user.profileImageUrl || "");

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

    const addCustomLink = () => {
        setCustomLinks((prev) => [...prev, { platform: "", url: "" }]);
    };

    const updateCustomLink = (index, field, value) => {
        setCustomLinks((prev) => prev.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry)));
    };

    const removeCustomLink = (index) => {
        setCustomLinks((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.username.trim()) return alert("Username is required");
        if (!formData.name.trim()) return alert("Name is required");

        setLoading(true);

        try {
            let profile_pic = previewUrl;
            if (imageFile) {
                profile_pic = await uploadImageToCloudinary(imageFile);
            }

            const customSocialLinks = customLinks.reduce((acc, entry) => {
                const platform = String(entry.platform || "").trim().toLowerCase();
                const url = String(entry.url || "").trim();

                if (platform && url) {
                    acc[platform] = url;
                }

                return acc;
            }, {});

            const updatedData = {
                username: formData.username,
                name: formData.name,
                bio: formData.bio,
                socialLinks: {
                    ...(formData.github.trim() ? { github: formData.github.trim() } : {}),
                    ...(formData.linkedin.trim() ? { linkedin: formData.linkedin.trim() } : {}),
                    ...(formData.portfolio.trim() ? { portfolio: formData.portfolio.trim() } : {}),
                    ...customSocialLinks,
                },
                profile_pic,
            };
            const updatedUser = await updateUserProfile(user.uid, updatedData);
            onUpdate(updatedUser);
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            const isNetworkError = error?.code === "ERR_NETWORK";
            const backendMessage = error?.response?.data?.error || error?.response?.data?.message;

            if (isNetworkError) {
                alert("Cannot reach backend API. Start backend server on http://localhost:5000 and try again.");
            } else {
                alert(backendMessage || "Failed to update profile");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        formData,
        imageFile,
        previewUrl,
        customLinks,
        handleChange,
        handleImageChange,
        handleRemovePhoto,
        addCustomLink,
        updateCustomLink,
        removeCustomLink,
        handleSubmit,
    };
}
