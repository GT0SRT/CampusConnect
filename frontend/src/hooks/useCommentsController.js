import { useCallback, useEffect, useState } from "react";
import { addComment, addReply, getComments } from "../services/interactionService";

export function useCommentsController({ postId, user }) {
    const currentUsername = user?.username || user?.email?.split("@")[0] || user?.name || "user";

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [expandedThreads, setExpandedThreads] = useState({});

    const fetchComments = useCallback(async ({ showLoader = false } = {}) => {
        if (showLoader) {
            setLoading(true);
        }
        const data = await getComments(postId);
        setComments(data || []);
        setLoading(false);
    }, [postId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchComments();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchComments]);

    const handleReplySubmit = async (parentId, text) => {
        try {
            setComments((prev) =>
                prev.map((comment) => {
                    if (comment.id === parentId) {
                        const optimisticReply = {
                            id: Date.now().toString(),
                            text,
                            author: { name: user.name, username: currentUsername, profile_pic: user.profile_pic },
                            createdAt: new Date().toISOString(),
                        };
                        setExpandedThreads((prevExpanded) => ({ ...prevExpanded, [parentId]: true }));
                        return { ...comment, replies: [...(comment.replies || []), optimisticReply] };
                    }
                    return comment;
                })
            );

            setNewComment("");
            setReplyingTo(null);
            await addReply(postId, parentId, user, text);
        } catch (error) {
            console.error("Failed to reply", error);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!newComment.trim() || !user) return;

        if (replyingTo) {
            await handleReplySubmit(replyingTo.parentId, newComment);
            return;
        }

        try {
            const optimisticComment = {
                id: Date.now().toString(),
                text: newComment,
                createdAt: { seconds: Date.now() / 1000 },
                author: { name: user.name, username: currentUsername, profile_pic: user.profile_pic },
                replies: [],
            };
            setComments((prev) => [optimisticComment, ...prev]);
            setNewComment("");
            await addComment(user.uid, postId, newComment);
            fetchComments({ showLoader: true });
        } catch (error) {
            console.error("Failed to comment", error);
        }
    };

    const initiateReply = (parentId, username) => {
        const cleanUsername = String(username || "user").replace(/^@/, "").trim();
        setReplyingTo({ parentId, username: cleanUsername });
        setNewComment(`@${cleanUsername} `);
    };

    const toggleThread = (commentId) => {
        setExpandedThreads((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    return {
        comments,
        newComment,
        setNewComment,
        loading,
        replyingTo,
        setReplyingTo,
        expandedThreads,
        handleCommentSubmit,
        initiateReply,
        toggleThread,
    };
}
