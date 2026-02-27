const prisma = require("../lib/prisma");


// ➜ Create Thread
exports.createThread = async (req, res) => {
  try {
    const { title, description, tags, collegeName } = req.body;

    const thread = await prisma.thread.create({
      data: {
        title,
        description,
        tags,
        collegeName,
        authorId: req.user.id,
      },
    });

    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ➜ Get All Threads
exports.getThreads = async (req, res) => {
  try {
    const { limit = 10, cursor } = req.query;
    const take = parseInt(limit, 10);

    const threads = await prisma.thread.findMany({
      take,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        author: true,
        votes: {
          select: {
            userId: true,
            type: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const nextCursor = threads.length === take ? threads[threads.length - 1].id : null;

    res.json({
      data: threads,
      nextCursor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getThreadById = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: true,
        votes: {
          select: {
            userId: true,
            type: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "asc",
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
        },
      },
    });

    if (!thread) {
      return res.status(404).json({ msg: "Thread not found" });
    }

    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ➜ Vote Thread (UP / DOWN)
exports.voteThread = async (req, res) => {
  const { threadId, type } = req.body; // type = UP or DOWN

  try {
    const vote = await prisma.threadVote.upsert({
      where: {
        userId_threadId: {
          userId: req.user.id,
          threadId,
        },
      },
      update: { type },
      create: {
        userId: req.user.id,
        threadId,
        type,
      },
    });

    res.json(vote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.saveThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.body;

    const saved = await prisma.savedThread.create({
      data: {
        userId,
        threadId
      }
    });

    res.json({ message: "Thread saved successfully", saved });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unsaveThread = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.body;

    await prisma.savedThread.delete({
      where: {
        userId_threadId: {
          userId,
          threadId,
        },
      },
    });

    res.json({ msg: "Thread unsaved successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(400).json({ msg: "Thread was not saved" });
    }
    res.status(500).json({ error: error.message });
  }
};



// ➜ Get Saved Threads
exports.getSavedThreads = async (req, res) => {
  const saved = await prisma.savedThread.findMany({
    where: { userId: req.user.id },
    include: {
      thread: true,
    },
  });

  res.json(saved);
};




exports.getMyThreads = async (req, res) => {
  try {
    const userId = req.user.id;

    const threads = await prisma.thread.findMany({
      where: { authorId: userId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(threads);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return res.status(404).json({ msg: "Thread not found" });
    }

    if (thread.authorId !== req.user.id) {
      return res.status(403).json({ msg: "Not allowed to delete this thread" });
    }

    await prisma.thread.delete({
      where: { id: threadId },
    });

    res.json({ msg: "Thread deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
