jest.mock('../src/lib/prisma', () => ({
    thread: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
    },
    threadVote: {
        upsert: jest.fn(),
    },
}));

const prisma = require('../src/lib/prisma');
const {
    createThread,
    getThreads,
    getThreadById,
    voteThread,
    deleteThread,
} = require('../src/controllers/threadController');

const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('threadController (unit)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('createThread: creates thread with req.user.id', async () => {
        const created = {
            id: 'thread-1',
            title: 'Need React dev',
            description: 'Hackathon this weekend',
            tags: ['react'],
            collegeName: 'ABC College',
            authorId: 'user-1',
        };

        prisma.thread.create.mockResolvedValue(created);

        const req = {
            body: {
                title: 'Need React dev',
                description: 'Hackathon this weekend',
                tags: ['react'],
                collegeName: 'ABC College',
            },
            user: { id: 'user-1' },
        };
        const res = createMockRes();

        await createThread(req, res);

        expect(prisma.thread.create).toHaveBeenCalledWith({
            data: {
                title: 'Need React dev',
                description: 'Hackathon this weekend',
                tags: ['react'],
                collegeName: 'ABC College',
                authorId: 'user-1',
            },
        });
        expect(res.json).toHaveBeenCalledWith(created);
    });

    it('getThreads: returns paginated data with nextCursor', async () => {
        const threads = [
            { id: 'thread-1', title: 'T1' },
            { id: 'thread-2', title: 'T2' },
        ];

        prisma.thread.findMany.mockResolvedValue(threads);

        const req = { query: { limit: '2' } };
        const res = createMockRes();

        await getThreads(req, res);

        expect(prisma.thread.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 2,
                orderBy: { createdAt: 'desc' },
            })
        );
        expect(res.json).toHaveBeenCalledWith({
            data: threads,
            nextCursor: 'thread-2',
        });
    });

    it('getThreadById: returns 404 when thread does not exist', async () => {
        prisma.thread.findUnique.mockResolvedValue(null);

        const req = { params: { threadId: 'missing-thread' } };
        const res = createMockRes();

        await getThreadById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Thread not found' });
    });

    it('voteThread: upserts vote and returns result', async () => {
        const vote = { userId: 'user-1', threadId: 'thread-1', type: 'UP' };
        prisma.threadVote.upsert.mockResolvedValue(vote);

        const req = {
            body: { threadId: 'thread-1', type: 'UP' },
            user: { id: 'user-1' },
        };
        const res = createMockRes();

        await voteThread(req, res);

        expect(prisma.threadVote.upsert).toHaveBeenCalledWith({
            where: {
                userId_threadId: {
                    userId: 'user-1',
                    threadId: 'thread-1',
                },
            },
            update: { type: 'UP' },
            create: {
                userId: 'user-1',
                threadId: 'thread-1',
                type: 'UP',
            },
        });
        expect(res.json).toHaveBeenCalledWith(vote);
    });

    it('deleteThread: returns 403 when user is not owner', async () => {
        prisma.thread.findUnique.mockResolvedValue({
            id: 'thread-1',
            authorId: 'owner-1',
        });

        const req = {
            params: { threadId: 'thread-1' },
            user: { id: 'other-user' },
        };
        const res = createMockRes();

        await deleteThread(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ msg: 'Not allowed to delete this thread' });
        expect(prisma.thread.delete).not.toHaveBeenCalled();
    });
});
