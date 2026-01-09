import {
  collection, addDoc, query, where, getDocs, serverTimestamp,
  doc, updateDoc, increment, orderBy, getDoc, deleteDoc, limit, startAfter
} from "firebase/firestore";
import { db } from "../firebase";
import { selectListFields, createPaginationResult } from "../utils/pagination";

export const CreateThread = async (uid, title, description, category, userDetails) => {
  try {
    const postRef = await addDoc(collection(db, "threads"), {
      uid: uid,
      title: title,
      description: description,
      votes: 0,
      upvotes: [],
      downvotes: [],
      category: category,
      createdAt: serverTimestamp(),
      author: {
        name: userDetails.name || "User",
        profile_pic: userDetails.profile_pic || ""
      },
      Discussion: [],
      campus: userDetails.campus,
      branch: userDetails.branch,
      batch: userDetails.batch,
    });
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      threadsCount: increment(1)
    });

    return postRef.id;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};

export const deleteThread = async (threadId, uid) => {
  try {
    await deleteDoc(doc(db, "threads", threadId));
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      threadsCount: increment(-1)
    });

  } catch (error) {
    console.error("Error deleting thread:", error);
    throw error;
  }
};

export const getUserThreads = async (uid) => {
  try {
    const q = query(collection(db, "threads"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
};

export const getThreadsByIds = async (threadIds) => {
  if (!threadIds || threadIds.length === 0) return [];

  try {
    const promises = threadIds.map(id => getDoc(doc(db, "threads", id)));
    const snapshots = await Promise.all(promises);

    return snapshots
      .filter(snap => snap.exists())
      .map(snap => ({ id: snap.id, ...snap.data() }));
  } catch (error) {
    console.error("Error fetching saved threads:", error);
    return [];
  }
};

export const getAllThreads = async () => {
  try {
    const q = query(collection(db, "threads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const postsPromises = querySnapshot.docs.map(async (postDoc) => {
      const postData = postDoc.data();

      let authorData = { name: "Unknown User", profile_pic: "" };
      if (postData.uid) {
        const userRef = doc(db, "users", postData.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          authorData = userSnap.data();
        }
      }

      return {
        id: postDoc.id,
        ...postData,
        author: authorData
      };
    });

    const postsWithAuthors = await Promise.all(postsPromises);
    return postsWithAuthors;

  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
};

// Vote on a thread
export const voteOnThread = async (threadId, uid, voteType) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const snap = await getDoc(threadRef);
    if (!snap.exists()) throw new Error("Thread not found");

    const data = snap.data();
    const upvotes = Array.isArray(data.upvotes) ? [...data.upvotes] : [];
    const downvotes = Array.isArray(data.downvotes) ? [...data.downvotes] : [];

    const inUp = upvotes.includes(uid);
    const inDown = downvotes.includes(uid);

    if (inUp || inDown) {
      // Any click clears both if already voted
      const idxUp = upvotes.indexOf(uid);
      if (idxUp !== -1) upvotes.splice(idxUp, 1);
      const idxDown = downvotes.indexOf(uid);
      if (idxDown !== -1) downvotes.splice(idxDown, 1);
    } else {
      if (voteType === "up") {
        upvotes.push(uid);
      } else if (voteType === "down") {
        downvotes.push(uid);
      }
    }

    const votes = upvotes.length - downvotes.length;

    await updateDoc(threadRef, {
      upvotes,
      downvotes,
      votes
    });
  } catch (error) {
    console.error("Error voting on thread:", error);
    throw error;
  }
};

// Add an answer (reply) to a thread
export const addAnswerToThread = async (threadId, uid, content, userDetails) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) throw new Error("Thread not found");

    const currentDiscussion = threadSnap.data().Discussion || [];

    const answer = {
      id: Date.now().toString(),
      uid: uid,
      author: {
        name: userDetails.name || "User",
        profile_pic: userDetails.profile_pic || ""
      },
      content: content,
      createdAt: new Date().toISOString(),
      replies: [],
      votes: 0,
      upvotes: [],
      downvotes: []
    };

    await updateDoc(threadRef, {
      Discussion: [...currentDiscussion, answer]
    });

    return answer.id;
  } catch (error) {
    console.error("Error adding answer to thread:", error);
    throw error;
  }
};

// Add a reply (comment) to an answer
export const addReplyToAnswer = async (threadId, answerId, uid, content, userDetails, parentReplyId = null) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) throw new Error("Thread not found");

    const discussion = threadSnap.data().Discussion || [];
    const answerIndex = discussion.findIndex(ans => ans.id === answerId);

    if (answerIndex === -1) throw new Error("Answer not found");

    const reply = {
      id: Date.now().toString(),
      uid: uid,
      author: {
        name: userDetails.name || "User",
        profile_pic: userDetails.profile_pic || ""
      },
      content: content,
      createdAt: new Date().toISOString(),
      parentId: parentReplyId,
      replies: []
    };

    const insertNestedReply = (repliesList = []) => {
      for (let i = 0; i < repliesList.length; i++) {
        const current = repliesList[i];
        if (current.id === parentReplyId) {
          current.replies = [...(current.replies || []), reply];
          return true;
        }
        if (current.replies && insertNestedReply(current.replies)) {
          return true;
        }
      }
      return false;
    };

    if (parentReplyId) {
      const inserted = insertNestedReply(discussion[answerIndex].replies || []);
      if (!inserted) {
        // parent not found, fallback to top-level replies
        discussion[answerIndex].replies = [...(discussion[answerIndex].replies || []), reply];
      }
    } else {
      discussion[answerIndex].replies = [...(discussion[answerIndex].replies || []), reply];
    }

    await updateDoc(threadRef, {
      Discussion: discussion
    });

    return reply.id;
  } catch (error) {
    console.error("Error adding reply to answer:", error);
    throw error;
  }
};

// Get a single thread with all its data
export const getThreadById = async (threadId) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) return null;

    const threadData = threadSnap.data();
    let authorData = { name: "Unknown User", profile_pic: "" };

    if (threadData.uid) {
      const userRef = doc(db, "users", threadData.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        authorData = userSnap.data();
      }
    }

    return {
      id: threadSnap.id,
      ...threadData,
      author: authorData
    };
  } catch (error) {
    console.error("Error fetching thread:", error);
    throw error;
  }
};

// Vote on an answer
export const voteOnAnswer = async (threadId, answerId, uid, voteType) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) throw new Error("Thread not found");

    const discussion = threadSnap.data().Discussion || [];
    const answerIndex = discussion.findIndex(ans => ans.id === answerId);

    if (answerIndex === -1) throw new Error("Answer not found");

    const answer = discussion[answerIndex];
    const upvotes = Array.isArray(answer.upvotes) ? [...answer.upvotes] : [];
    const downvotes = Array.isArray(answer.downvotes) ? [...answer.downvotes] : [];

    const inUp = upvotes.includes(uid);
    const inDown = downvotes.includes(uid);

    if (inUp || inDown) {
      const idxUp = upvotes.indexOf(uid);
      if (idxUp !== -1) upvotes.splice(idxUp, 1);
      const idxDown = downvotes.indexOf(uid);
      if (idxDown !== -1) downvotes.splice(idxDown, 1);
    } else {
      if (voteType === "up") {
        upvotes.push(uid);
      } else if (voteType === "down") {
        downvotes.push(uid);
      }
    }

    const votes = upvotes.length - downvotes.length;

    discussion[answerIndex] = {
      ...answer,
      upvotes,
      downvotes,
      votes
    };

    await updateDoc(threadRef, {
      Discussion: discussion
    });
  } catch (error) {
    console.error("Error voting on answer:", error);
    throw error;
  }
};

export const getPaginatedThreads = async (cursor = null, pageSize = 10) => {
  try {
    let q;
    if (cursor) {
      const cursorData = JSON.parse(atob(cursor));
      const cursorDoc = await getDoc(doc(db, "threads", cursorData.id));

      q = query(
        collection(db, "threads"),
        orderBy("createdAt", "desc"),
        startAfter(cursorDoc),
        limit(pageSize + 1)
      );
    } else {
      q = query(
        collection(db, "threads"),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(q);
    const threads = querySnapshot.docs.map(threadDoc => ({
      id: threadDoc.id,
      ...selectListFields({ id: threadDoc.id, ...threadDoc.data() }, 'thread')
    }));

    return createPaginationResult(threads, pageSize);

  } catch (error) {
    console.error("Error fetching paginated threads:", error);
    throw error;
  }
};

export const getUserThreadsPaginated = async (uid, cursor = null, pageSize = 10) => {
  try {
    let q;
    if (cursor) {
      const cursorData = JSON.parse(atob(cursor));
      const cursorDoc = await getDoc(doc(db, "threads", cursorData.id));

      q = query(
        collection(db, "threads"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
        startAfter(cursorDoc),
        limit(pageSize + 1)
      );
    } else {
      q = query(
        collection(db, "threads"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(q);
    const threads = querySnapshot.docs.map(threadDoc => ({
      id: threadDoc.id,
      ...selectListFields({ id: threadDoc.id, ...threadDoc.data() }, 'thread')
    }));

    return createPaginationResult(threads, pageSize);

  } catch (error) {
    console.error("Error fetching user threads paginated:", error);
    throw error;
  }
};

export const getThreadDetailsForDisplay = async (threadId) => {
  try {
    const threadRef = doc(db, "threads", threadId);
    const threadSnap = await getDoc(threadRef);

    if (!threadSnap.exists()) return null;

    const threadData = threadSnap.data();
    let authorData = { name: "Unknown User", profile_pic: "" };

    if (threadData.uid) {
      const userRef = doc(db, "users", threadData.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        authorData = userSnap.data();
      }
    }

    return {
      id: threadSnap.id,
      ...threadData,
      author: authorData
    };
  } catch (error) {
    console.error("Error fetching thread details for display:", error);
    throw error;
  }
};