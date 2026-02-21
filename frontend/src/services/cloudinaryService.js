export function validateImageFile(file, maxSizeMb = 10) {
    if (!file) {
        return { valid: false, message: "Please select an image file." };
    }

    if (!file.type?.startsWith("image/")) {
        return { valid: false, message: "Please select an image file" };
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
        return { valid: false, message: `Image size should be less than ${maxSizeMb}MB` };
    }

    return { valid: true, message: "" };
}

export async function uploadImageToCloudinary(file) {
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!preset || !cloudName) {
        throw new Error("Cloudinary environment variables are missing");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    const data = await response.json();
    if (!data?.secure_url) {
        throw new Error("Invalid upload response");
    }

    return data.secure_url;
}

export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = typeof result === "string" ? result.split(",")[1] || result : result;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
