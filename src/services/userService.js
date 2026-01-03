import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const checkUserProfileExists = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

export const createUserProfile = async (uid, email, formData, profilePicUrl) => {
  try {
    const userRef = doc(db, "users", uid);
    const userData = {
      uid: uid,
      email: email,
      name: formData.name,
      bio: formData.bio || "",  
      campus: formData.campus,
      batch: formData.batch,
      branch: formData.branch,
      profile_pic: profilePicUrl || "https://via.placeholder.com/150",
      postsCount: 0,
      threadsCount: 0,
      karmaCount: 0,
      createdAt: serverTimestamp()
    };

    await setDoc(userRef, userData);
    return userData;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid, updateData) => {
  try {
    const userRef = doc(db, "users", uid);
    // updateDoc only updates the fields passed to it, leaving Karma/Posts intact
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp() 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};