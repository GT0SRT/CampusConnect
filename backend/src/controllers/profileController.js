const prisma = require("../lib/prisma");


// ================= PROFILE =================

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const data = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= POSTS =================

// Save Post
exports.savePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    await prisma.savedPost.create({
      data: { userId, postId }
    });

    res.json({ message: "Post saved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Saved Posts
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: true,
            likes: true,
            comments: true
          }
        }
      }
    });

    res.json(posts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get My Posts
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        likes: true,
        comments: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(posts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= KARMA =================

// Get Karma
exports.getKarma = async (req, res) => {
  try {
    const userId = req.user.id;

    const likes = await prisma.postLike.count({
      where: {
        post: { authorId: userId }
      }
    });

    const comments = await prisma.comment.count({
      where: {
        post: { authorId: userId }
      }
    });

    const karma = likes + comments;

    res.json({ likes, comments, karma });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= SAVED THREADS =================

// Get Saved Threads
exports.getSavedThreads = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedThreads = await prisma.savedThread.findMany({
      where: { userId },
      include: {
        thread: {
          include: {
            author: true,
            comments: true
          }
        }
      }
    });

    res.json(savedThreads);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= LIKE =================

// Like / Unlike Post
exports.likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    const existing = await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    if (existing) {
      await prisma.postLike.delete({
        where: {
          userId_postId: { userId, postId }
        }
      });
      return res.json({ message: "Unliked" });
    }

    await prisma.postLike.create({
      data: { userId, postId }
    });

    res.json({ message: "Liked" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= COMMENT =================

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId
      }
    });

    res.json(comment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ================= PROFILE STATS (IMPORTANT) =================

// Posts / Threads / Saved / Karma counts
exports.getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const postsCount = await prisma.post.count({
      where: { authorId: userId }
    });

    const threadsCount = await prisma.thread.count({
      where: { authorId: userId }
    });

    const savedCount = await prisma.savedPost.count({
      where: { userId }
    });

    const likes = await prisma.postLike.count({
      where: { post: { authorId: userId } }
    });

    const comments = await prisma.comment.count({
      where: { post: { authorId: userId } }
    });

    const karma = likes + comments;

    res.json({
      posts: postsCount,
      threads: threadsCount,
      saved: savedCount,
      karma
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
