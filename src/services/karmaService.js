import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const calculateUserKarma = async (uid) => {
  let karma = 0;

  const postsQuery = query(
    collection(db, "posts"),
    where("uid", "==", uid)
  );

  const postsSnap = await getDocs(postsQuery);
  postsSnap.forEach(doc => {
    const post = doc.data();
    karma += post.likes || 0;
  });

  const threadsQuery = query(
    collection(db, "threads"),
    where("uid", "==", uid)
  );

  const threadsSnap = await getDocs(threadsQuery);
  threadsSnap.forEach(doc => {
    const thread = doc.data();
    const up = thread.upvotes?.length || 0;
    const down = thread.downvotes?.length || 0;
    karma += (up - down);
  });

  return karma;
};
