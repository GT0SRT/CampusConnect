import { useState } from "react";
import { CreateThread as createThreadService } from "../services/threadService";

export function useCreateThreadController({ user, onClose, onThreadCreated }) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!user) return alert("Please log in to create a thread.");

        if (!title.trim()) return alert("Please enter a title.");
        if (!category) return alert("Please select a category.");
        if (category === "other" && !customCategory.trim()) return alert("Please specify the category.");
        if (!content || content === "<p></p>") return alert("Please add a description.");

        setLoading(true);
        try {
            const finalCategory = category === "other" ? customCategory : category;
            await createThreadService(user.uid, title, content, finalCategory, user);
            if (onThreadCreated) onThreadCreated();
            onClose();
        } catch (error) {
            console.error("Thread creation failed:", error);
            alert("Failed to create thread.");
        } finally {
            setLoading(false);
        }
    };

    return {
        title,
        setTitle,
        category,
        setCategory,
        customCategory,
        setCustomCategory,
        content,
        setContent,
        loading,
        handleSubmit,
    };
}
