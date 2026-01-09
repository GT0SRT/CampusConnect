import {
  collection, addDoc, query, where, getDocs, serverTimestamp,
  doc, updateDoc, increment, orderBy, getDoc, deleteDoc, limit, startAfter
} from "firebase/firestore";
import { db } from "../firebase";
import { selectListFields, createPaginationResult } from "../utils/pagination";

export const createPost = async (uid, imageUrl, caption, userDetails) => {
  try {
    const postRef = await addDoc(collection(db, "posts"), {
      uid: uid,
      imageUrl: imageUrl,
      caption: caption || "",
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
      author: {
        name: userDetails.name || "User",
        profile_pic: userDetails.profile_pic || ""
      },
      campus: userDetails.campus || "",
      branch: userDetails.branch || "",
      batch: userDetails.batch || ""
    });
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      postsCount: increment(1)
    });

    return postRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const deletePost = async (postId, uid) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      postsCount: increment(-1)
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const getUserPosts = async (uid) => {
  try {
    const q = query(collection(db, "posts"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

export const getPostsByIds = async (postIds) => {
  if (!postIds || postIds.length === 0) return [];

  try {
    const promises = postIds.map(id => getDoc(doc(db, "posts", id)));
    const snapshots = await Promise.all(promises);

    return snapshots
      .filter(snap => snap.exists())
      .map(snap => ({ id: snap.id, ...snap.data() }));
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
};

export const getAllPosts = async () => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
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

export const getPaginatedFeed = async (cursor = null, pageSize = 10) => {
  try {
    // Build query for most recent posts first
    let q;
    if (cursor) {
      // If we have a cursor, start after the last item from previous page
      const cursorData = JSON.parse(atob(cursor));
      const cursorDoc = await getDoc(doc(db, "posts", cursorData.id));

      q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(cursorDoc),
        limit(pageSize + 1) // Fetch one extra to detect if more pages exist
      );
    } else {
      // First page just get the most recent posts
      q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = [];

    // Convert documents with minimal fields for list view
    for (const postDoc of querySnapshot.docs) {
      const postData = postDoc.data();
      posts.push({
        id: postDoc.id,
        ...selectListFields({ id: postDoc.id, ...postData }, 'post')
      });
    }

    // Return standardized pagination response
    return createPaginationResult(posts, pageSize);

  } catch (error) {
    console.error("Error fetching paginated feed:", error);
    throw error;
  }
};

export const getUserPostsPaginated = async (uid, cursor = null, pageSize = 10) => {
  try {
    let q;
    if (cursor) {
      const cursorData = JSON.parse(atob(cursor));
      const cursorDoc = await getDoc(doc(db, "posts", cursorData.id));

      q = query(
        collection(db, "posts"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
        startAfter(cursorDoc),
        limit(pageSize + 1)
      );
    } else {
      q = query(
        collection(db, "posts"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );
    }

    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(postDoc => ({
      id: postDoc.id,
      ...selectListFields({ id: postDoc.id, ...postDoc.data() }, 'post')
    }));

    return createPaginationResult(posts, pageSize);

  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

export const getPostDetailsForDisplay = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return null;

    const postData = postSnap.data();

    // Fetch full author profile (secondary data)
    let authorData = { name: "Unknown User", profile_pic: "" };
    if (postData.uid) {
      const userRef = doc(db, "users", postData.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        authorData = userSnap.data();
      }
    }

    return {
      id: postSnap.id,
      ...postData,
      author: authorData
    };

  } catch (error) {
    console.error("Error fetching post details:", error);
    throw error;
  }
};