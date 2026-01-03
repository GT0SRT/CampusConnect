import { 
  collection, addDoc, query, where, getDocs, serverTimestamp, 
  doc, updateDoc, increment, orderBy , getDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

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