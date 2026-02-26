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
  const threads = await prisma.thread.findMany({
    include: {
      author: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(threads);
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
