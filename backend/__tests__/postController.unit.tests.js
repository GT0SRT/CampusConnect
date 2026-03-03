jest.mock('../src/lib/prisma', () => ({
    post: {
        create: jest.fn(),
    },
}));

const prisma = require('../src/lib/prisma');
const { addPost } = require('../src/controllers/postController');

const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('postController.addPost (unit)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 400 when caption is missing', async () => {
        const req = {
            body: { caption: '', imageUrl: 'https://img.com/a.jpg' },
            user: { id: 'user-1' },
        };
        const res = createMockRes();

        await addPost(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'caption is required' });
        expect(prisma.post.create).not.toHaveBeenCalled();
    });

    it('returns 400 when imageUrl is missing', async () => {
        const req = {
            body: { caption: 'Hello world', imageUrl: '' },
            user: { id: 'user-1' },
        };
        const res = createMockRes();

        await addPost(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'imageUrl is required' });
        expect(prisma.post.create).not.toHaveBeenCalled();
    });

    it('creates post and returns 201 on valid payload', async () => {
        const createdPost = {
            id: 'post-1',
            caption: 'Hello world',
            imageUrl: 'https://img.com/a.jpg',
            authorId: 'user-1',
        };

        prisma.post.create.mockResolvedValue(createdPost);

        const req = {
            body: { caption: '  Hello world  ', imageUrl: '  https://img.com/a.jpg  ' },
            user: { id: 'user-1' },
        };
        const res = createMockRes();

        await addPost(req, res);

        expect(prisma.post.create).toHaveBeenCalledWith({
            data: {
                caption: 'Hello world',
                imageUrl: 'https://img.com/a.jpg',
                authorId: 'user-1',
            },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdPost);
    });

    it('returns 500 with friendly message on Prisma validation error', async () => {
        prisma.post.create.mockRejectedValue({ name: 'PrismaClientValidationError' });

        const req = {
            body: { caption: 'Hello', imageUrl: 'https://img.com/a.jpg' },
            user: { id: 'user-1' },
        };
        const res = createMockRes();

        await addPost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid post payload for current database schema.',
        });
    });
});
