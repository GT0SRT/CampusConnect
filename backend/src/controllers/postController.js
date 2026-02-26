const prisma = require("../lib/prisma");

exports.addPost = async (req, res) => {
  const { content, imageUrl, collegeName } = req.body;

  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      collegeName,
      authorId: req.user.id,
    },
  });

  res.json(post);
};

exports.savePost = async (req, res) => {
  const { postId } = req.body;

  const saved = await prisma.savedPost.create({
    data: {
      userId: req.user.id,
      postId,
    },
  });

  res.json(saved);
};


exports.getSavedPosts = async (req, res) => {
  const posts = await prisma.savedPost.findMany({
    where: { userId: req.user.id },
    include: {
      post: true,
    },
  });

  res.json(posts);
};


exports.deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    // check ownership (optional but recommended)
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.authorId !== req.user.id)
      return res.status(403).json({ msg: "Not allowed" });

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.likePost = async (req, res) => {
  const userId = req.user.id;
  const { postId } = req.body;

  try {
    await prisma.postLike.create({
      data: {
        userId,
        postId
      }
    });

    res.json({ message: "Liked" });
  } catch (err) {
    res.status(500).json(err.message);
  }
};



exports.addComment = async (req, res) => {
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
};
