import { useState } from "react";

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);

    const generateCaption = async () => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return "Campus moment captured ✨ #CampusConnect";
        } finally {
            setIsLoading(false);
        }
    };

    const chat = async (message) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 400));
            return `UI-only assistant response: ${message}`;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, generateCaption, chat };
}
