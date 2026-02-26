const prisma = require("../lib/prisma");

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
