import { useCallback, useEffect, useState } from "react";
import {
    getThreadById,
    addAnswerToThread,
    addReplyToAnswer,
    voteOnThread,
    voteOnAnswer,
} from "../services/threadService";
import { toggleThreadBookmark } from "../services/interactionService";
import { useUserStore } from "../store/useUserStore";

export function countReplies(replies = []) {
    return replies.reduce((acc, reply) => acc + 1 + countReplies(reply.replies || []), 0);
}

export function useThreadViewController(threadId) {
    const { user, updateUser } = useUserStore();
    const theme = useUserStore((state) => state.theme);
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [answerContent, setAnswerContent] = useState("");
    const [submitingAnswer, setSubmittingAnswer] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);
    const [votingAnswers, setVotingAnswers] = useState({});
    const [votingThread, setVotingThread] = useState(false);
    const [openReplies, setOpenReplies] = useState({});
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setIsSaved(!!user?.savedThreads?.includes(threadId));
    }, [user?.savedThreads, threadId]);

    const fetchThread = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getThreadById(threadId);
            setThread(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        fetchThread();
    }, [fetchThread]);

    const handleVote = async (targetThreadId, voteType) => {
        if (votingThread || !user?.uid) return;

        try {
            setVotingThread(true);
            setThread((prevThread) => {
                if (!prevThread) return prevThread;
                const upvotes = Array.isArray(prevThread.upvotes) ? [...prevThread.upvotes] : [];
                const downvotes = Array.isArray(prevThread.downvotes) ? [...prevThread.downvotes] : [];
                const inUp = upvotes.includes(user.uid);
                const inDown = downvotes.includes(user.uid);

                if (inUp || inDown) {
                    if (inUp) upvotes.splice(upvotes.indexOf(user.uid), 1);
                    if (inDown) downvotes.splice(downvotes.indexOf(user.uid), 1);
                } else {
                    if (voteType === "up") upvotes.push(user.uid);
                    if (voteType === "down") downvotes.push(user.uid);
                }

                const votes = upvotes.length - downvotes.length;

                return {
                    ...prevThread,
                    upvotes,
                    downvotes,
                    votes,
                };
            });

            await voteOnThread(targetThreadId, voteType);
        } catch (error) {
            console.error("Error voting:", error);
            await fetchThread();
        } finally {
            setVotingThread(false);
        }
    };

    const handleSaveThread = async () => {
        if (!user?.uid) {
            alert("Please login to save");
            return;
        }

        const nextSaved = !isSaved;
        setIsSaved(nextSaved);

        const currentSaved = user.savedThreads || [];
        const updatedSaved = nextSaved
            ? (currentSaved.includes(threadId) ? currentSaved : [...currentSaved, threadId])
            : currentSaved.filter((id) => id !== threadId);
        updateUser({ savedThreads: updatedSaved });

        try {
            await toggleThreadBookmark(user.uid, threadId, isSaved);
        } catch (error) {
            console.error("Error saving thread:", error);
            setIsSaved(!nextSaved);
            updateUser({ savedThreads: currentSaved });
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answerContent.trim() || !user) return;

        try {
            setSubmittingAnswer(true);
            const tempId = `${Date.now()}`;
            const newAnswer = {
                id: tempId,
                uid: user.uid,
                author: {
                    username: user.username || user.email?.split("@")[0] || "user",
                    name: user.name || user.displayName || "User",
                    profile_pic: user.profile_pic || user.photoURL || "",
                },
                content: answerContent,
                createdAt: new Date().toISOString(),
                replies: [],
                votes: 0,
                upvotes: [],
                downvotes: [],
            };

            setThread((prev) => {
                if (!prev) return prev;
                const discussion = Array.isArray(prev.Discussion) ? [...prev.Discussion, newAnswer] : [newAnswer];
                return { ...prev, Discussion: discussion };
            });

            setAnswerContent("");
            setShowAnswerForm(false);

            const newId = await addAnswerToThread(threadId, answerContent);

            if (newId && newId !== tempId) {
                setThread((prev) => {
                    if (!prev) return prev;
                    const discussion = (prev.Discussion || []).map((ans) => (ans.id === tempId ? { ...ans, id: newId } : ans));
                    return { ...prev, Discussion: discussion };
                });
            }
        } catch (error) {
            console.error("Error adding answer:", error);
            alert("Failed to add answer");
            await fetchThread();
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const handleSubmitReply = async (answerId, parentReplyId = null) => {
        if (!replyContent.trim() || !user) return;

        try {
            setSubmittingReply(true);
            const tempId = `${Date.now()}`;
            const newReply = {
                id: tempId,
                uid: user.uid,
                author: {
                    username: user.username || user.email?.split("@")[0] || "user",
                    name: user.name || user.displayName || "User",
                    profile_pic: user.profile_pic || user.photoURL || "",
                },
                content: replyContent,
                createdAt: new Date().toISOString(),
                parentId: parentReplyId,
                replies: [],
            };

            const insertLocalReply = (targetReplies = []) => {
                if (!parentReplyId) return [...targetReplies, newReply];
                return targetReplies.map((replyItem) => {
                    if (replyItem.id === parentReplyId) {
                        return { ...replyItem, replies: [...(replyItem.replies || []), newReply] };
                    }
                    return {
                        ...replyItem,
                        replies: replyItem.replies ? insertLocalReply(replyItem.replies) : [],
                    };
                });
            };

            setThread((prev) => {
                if (!prev) return prev;
                const discussion = (prev.Discussion || []).map((answer) => {
                    if (answer.id !== answerId) return answer;
                    const updatedReplies = insertLocalReply(answer.replies || []);
                    return { ...answer, replies: updatedReplies };
                });
                return { ...prev, Discussion: discussion };
            });

            setReplyContent("");
            setReplyingTo(null);
            setOpenReplies((prev) => ({ ...prev, [answerId]: true }));

            const newId = await addReplyToAnswer(threadId, answerId, replyContent, parentReplyId);

            if (newId && newId !== tempId) {
                const syncIds = (items = []) =>
                    items.map((replyItem) => {
                        const nested = replyItem.replies ? syncIds(replyItem.replies) : [];
                        if (replyItem.id === tempId) return { ...replyItem, id: newId, replies: nested };
                        return { ...replyItem, replies: nested };
                    });

                setThread((prev) => {
                    if (!prev) return prev;
                    const discussion = (prev.Discussion || []).map((answer) => {
                        if (answer.id !== answerId) return answer;
                        return { ...answer, replies: syncIds(answer.replies || []) };
                    });
                    return { ...prev, Discussion: discussion };
                });
            }
        } catch (error) {
            console.error("Error adding reply:", error);
            alert("Failed to add reply");
            await fetchThread();
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleAnswerVote = async (answerId, voteType) => {
        if (votingAnswers[answerId] || !user?.uid) return;

        try {
            setVotingAnswers((prev) => ({ ...prev, [answerId]: true }));
            setThread((prevThread) => {
                if (!prevThread) return prevThread;
                const updatedDiscussion = prevThread.Discussion.map((answer) => {
                    if (answer.id !== answerId) return answer;

                    const upvotes = Array.isArray(answer.upvotes) ? [...answer.upvotes] : [];
                    const downvotes = Array.isArray(answer.downvotes) ? [...answer.downvotes] : [];
                    const inUp = upvotes.includes(user.uid);
                    const inDown = downvotes.includes(user.uid);

                    if (inUp || inDown) {
                        if (inUp) upvotes.splice(upvotes.indexOf(user.uid), 1);
                        if (inDown) downvotes.splice(downvotes.indexOf(user.uid), 1);
                    } else {
                        if (voteType === "up") upvotes.push(user.uid);
                        if (voteType === "down") downvotes.push(user.uid);
                    }

                    return {
                        ...answer,
                        upvotes,
                        downvotes,
                        votes: upvotes.length - downvotes.length,
                    };
                });
                return { ...prevThread, Discussion: updatedDiscussion };
            });

            await voteOnAnswer(threadId, answerId, user.uid, voteType);
        } catch (error) {
            console.error("Error voting on answer:", error);
            await fetchThread();
        } finally {
            setVotingAnswers((prev) => ({ ...prev, [answerId]: false }));
        }
    };

    return {
        user,
        theme,
        thread,
        loading,
        fetchThread,
        showAnswerForm,
        setShowAnswerForm,
        answerContent,
        setAnswerContent,
        submitingAnswer,
        replyingTo,
        setReplyingTo,
        replyContent,
        setReplyContent,
        submittingReply,
        votingAnswers,
        votingThread,
        openReplies,
        setOpenReplies,
        isSaved,
        handleVote,
        handleSaveThread,
        handleSubmitAnswer,
        handleSubmitReply,
        handleAnswerVote,
    };
}
