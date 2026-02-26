import { motion } from "framer-motion";

export const VoiceBlob = ({ isSpeaking }) => {
    return (
        <div className="flex items-center justify-center h-40 w-40">
            <motion.div
                animate={isSpeaking
                    ? {
                        scale: [1, 1.08, 0.96, 1.06, 1],
                        borderRadius: [
                            "58% 42% 33% 67% / 44% 54% 46% 56%",
                            "42% 58% 64% 36% / 56% 38% 62% 44%",
                            "62% 38% 48% 52% / 40% 58% 42% 60%",
                            "58% 42% 33% 67% / 44% 54% 46% 56%",
                        ],
                    }
                    : {
                        scale: 1,
                        borderRadius: "50%",
                    }}
                transition={isSpeaking ? {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {
                    type: false
                }}
                className="h-40 w-40 bg-linear-to-tr from-indigo-500 via-cyan-500 to-cyan-300 shadow-xl shadow-cyan-500/40"
            />
        </div>
    );
};