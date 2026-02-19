import { useState } from "react";
import { createPost } from "../services/postService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import { generateCaptionFromImageFile } from "../services/geminiService";

export function useCreatePostController({ user, onClose, onPostCreated }) {
    const [caption, setCaption] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState("");

    const styles = ["concise", "professional", "funny", "friendly", "motivational", "sarcastic"];

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
    };

    const handleGenerateCaption = async () => {
        if (!imageFile) {
            alert("Please select an image first to generate a caption.");
            return;
        }

        try {
            setAiLoading(true);
            const generatedCaption = await generateCaptionFromImageFile(imageFile, selectedStyle);
            setCaption(generatedCaption || "");
        } catch (error) {
            console.error(error);
            alert(error.message || "Caption generation failed");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!user?.name || !user?.campus || !user?.branch || !user?.batch) {
            alert("Please complete your profile first (name, campus, branch, and batch are required).");
            return;
        }

        if (!imageFile) {
            alert("Please select an image!");
            return;
        }

        if (!user) {
            alert("User profile not loaded. Please refresh.");
            return;
        }

        setLoading(true);
        try {
            const imageUrl = await uploadImageToCloudinary(imageFile);
            await createPost(user.uid, imageUrl, caption, user);
            if (onPostCreated) onPostCreated();
            onClose();
        } catch (error) {
            console.error("Post failed", error);
            alert("Failed to post");
        } finally {
            setLoading(false);
        }
    };

    return {
        styles,
        caption,
        setCaption,
        imageFile,
        previewUrl,
        loading,
        aiLoading,
        selectedStyle,
        setSelectedStyle,
        handleImageChange,
        clearImage,
        handleGenerateCaption,
        handleSubmit,
    };
}
