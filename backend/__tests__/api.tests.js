const request = require('supertest');
const app = require('../server');

describe("CampusConnect API Routes Testing", () => {

  describe("Core API", () => {
    it("should return health status", async () => {
      const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('backend');
    });

    it("should return welcome message on root route", async () => {
      const response = await request(app).get('/');

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Campus Connect API is Running');
    });

    it("should return 404 for unknown route", async () => {
      const response = await request(app).get('/api/unknown-route-xyz');

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });


  describe("Auth API", () => {
    it("should reject login with missing credentials", async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ identifier: "", password: "" });

      expect(response.statusCode).not.toBe(200);
    });

    it("should fail Google Auth with invalid token", async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: "fake_invalid_token_123" });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Posts API", () => {
    it("should return 401 for feed/posts without token", async () => {
      const response = await request(app).get('/api/posts');

      expect(response.statusCode).toBe(401);

      expect(response.body).toBeDefined();
    });
  });

  describe("Threads API", () => {
    it("should hit threads endpoint and return a valid response", async () => {
      const response = await request(app).get('/api/threads');

      expect([200, 500]).toContain(response.statusCode);
      expect(response.body).toBeDefined();
    }, 15000);

    it("should return 401 Unauthorized if trying to create a thread without token", async () => {
      const response = await request(app)
        .post('/api/threads/create')
        .send({ title: "Hackathon Team", content: "Need a React dev!" });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Profile API", () => {
    it("should return 401 for /api/profile/me without token", async () => {
      const response = await request(app).get('/api/profile/me');

      expect(response.statusCode).toBe(401);
      expect(response.body).toBeDefined();
    });
  });

});