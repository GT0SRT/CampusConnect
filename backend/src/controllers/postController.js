const prisma = require("../lib/prisma");

exports.addPost = async (req, res) => {
  try {
    const { caption, imageUrl } = req.body;

    if (!caption || !String(caption).trim()) {
      return res.status(400).json({ error: "caption is required" });
    }

    if (!imageUrl || !String(imageUrl).trim()) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const post = await prisma.post.create({
      data: {
        caption: String(caption).trim(),
        imageUrl: String(imageUrl).trim(),
        authorId: req.user.id,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    if (err.name === "PrismaClientValidationError") {
      return res.status(500).json({
        error: "Invalid post payload for current database schema.",
      });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const saved = await prisma.savedPost.create({
      data: {
        userId: req.user.id,
        postId,
      },
    });

    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ msg: "Post already saved" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.DeleteSavedPost = async (req, res) => {
  try {
    const { postId } = req.body;
    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    res.json({ msg: "Post unsaved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const posts = await prisma.savedPost.findMany({
      where: { userId: req.user.id },
      include: {
        post: true,
      },
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.authorId !== req.user.id)
      return res.status(403).json({ msg: "Not allowed to delete this post" });

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;

    await prisma.postLike.create({
      data: {
        userId,
        postId
      }
    });

    res.status(201).json({ message: "Liked successfully" });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ msg: "Already liked" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.body;
    await prisma.postLike.delete({
      where: {
        userId_postId: { userId, postId }
      }
    });
    res.json({ msg: "Unliked successfully" });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(400).json({ msg: "Post was not liked" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId, content, parentId = null } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: "content is required" });
    }

    const comment = await prisma.comment.create({
      data: {
        content: String(content).trim(),
        authorId: userId,
        postId,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
      },
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (comment.authorId !== userId)
      return res.status(403).json({ msg: "Not allowed to delete this comment" });

    await prisma.comment.delete({
      where: { id: commentId },
    });
    res.json({ msg: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    // Get the limit and cursor from the frontend URL query
    const { limit = 10, cursor } = req.query;
    const take = parseInt(limit);

    const posts = await prisma.post.findMany({
      take: take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      
      orderBy: { createdAt: 'desc' },
      
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

    res.json({
      data: posts,
      nextCursor
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};