import {
  collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, increment, serverTimestamp, arrayUnion, arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";

// bookmarks
export const toggleBookmark = async (userId, postId, isAlreadySaved) => {
  try {
    const userRef = doc(db, "users", userId);

    if (isAlreadySaved) {
      await updateDoc(userRef, {
        savedPosts: arrayRemove(postId)
      });
    } else {
      await updateDoc(userRef, {
        savedPosts: arrayUnion(postId)
      });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

// Thread bookmarks
export const toggleThreadBookmark = async (userId, threadId, isAlreadySaved) => {
  try {
    const userRef = doc(db, "users", userId);

    if (isAlreadySaved) {
      await updateDoc(userRef, {
        savedThreads: arrayRemove(threadId)
      });
    } else {
      await updateDoc(userRef, {
        savedThreads: arrayUnion(threadId)
      });
    }
  } catch (error) {
    console.error("Error toggling thread bookmark:", error);
    throw error;
  }
};

// comments
export const addComment = async (userId, postId, commentText) => {
  try {
    await addDoc(collection(db, "comments"), {
      userId,
      postId,
      text: commentText,
      createdAt: serverTimestamp()
    });

    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: increment(1)
    });

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      commentIds: arrayUnion(postId)
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const addReply = async (commentId, user, text) => {
  try {
    const replyData = {
      id: Date.now().toString(), // Simple ID
      text: text,
      uid: user.uid,
      author: {
        name: user.name || "User",
        profile_pic: user.profile_pic || ""
      },
      createdAt: new Date().toISOString()
    };

    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      replies: arrayUnion(replyData)
    });

    return replyData;
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
};

export const toggleLike = async (userId, postId, isAlreadyLiked) => {
  try {
    const postRef = doc(db, "posts", postId);

    if (isAlreadyLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: increment(-1)
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: increment(1)
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

// GET COMMENTS
export const getComments = async (postId) => {
  try {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    // Fetch author details for each comment
    const commentsPromises = snapshot.docs.map(async (commentDoc) => {
      const data = commentDoc.data();

      let author = { name: "Unknown", profile_pic: "" };
      if (data.userId) {
        const userSnap = await getDoc(doc(db, "users", data.userId));
        if (userSnap.exists()) {
          author = userSnap.data();
        }
      }

      return {
        id: commentDoc.id,
        ...data,
        author
      };
    });

    return await Promise.all(commentsPromises);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};