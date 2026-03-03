const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const { generateTokenAndSetCookie } = require("../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const mapAuthUser = (user) => ({
  id: user.id,
  uid: user.id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  profileImageUrl: user.profileImageUrl,
  collegeName: user.collegeName || "",
  headline: user.headline || "",
  about: user.about,
  tags: user.tags,
  skills: user.skills,
  interests: user.interests,
  socialLinks: user.socialLinks,
  education: user.education,
  experience: user.experience,
  projects: user.projects,
  profileCompletePercentage: user.profileCompletePercentage ?? 0,
});

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "all fields are required" });
    }

    if (String(password) !== String(confirmPassword)) {
      return res.status(400).json({ error: "password do not match" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      return res.status(400).json({ error: "username is required" });
    }

    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userExists) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const usernameExists = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
      },
    });

    if (usernameExists) {
      return res.status(400).json({ error: "Username already taken. Try another username" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        authProvider: "LOCAL",
        fullName: "",
        profileImageUrl: "",
        about: "",
        tags: [],
        skills: [],
        interests: [],
        socialLinks: {},
        education: [],
        experience: [],
        projects: [],
        profileCompletePercentage: 0,
      },
    });

    const authToken = generateTokenAndSetCookie(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: mapAuthUser(user),
        token: authToken,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      const conflictField = Array.isArray(error.meta?.target)
        ? error.meta.target[0]
        : error.meta?.target;
      if (conflictField === "email") return res.status(400).json({ error: "User already exists with this email" });
      if (conflictField === "username") return res.status(400).json({ error: "Username already taken. Try another username" });
      return res.status(400).json({ error: "Duplicate user details found" });
    }
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginIdentifier = String(identifier || email || username || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "email/username and password are required" });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { username: { equals: loginIdentifier, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Please login with Google" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    const token = generateTokenAndSetCookie(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: mapAuthUser(user),
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token: googleIdToken } = req.body;

    if (!googleIdToken) {
      return res.status(400).json({ error: "Google token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Generate a unique username based on email
      const baseUsername = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      const uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email: normalizedEmail,
          fullName: name,
          profileImageUrl: picture,
          authProvider: "GOOGLE",
          about: "",
          tags: [],
          skills: [],
          interests: [],
          socialLinks: {},
          education: [],
          experience: [],
          projects: [],
          profileCompletePercentage: 0,
        },
      });
    }

    const authToken = generateTokenAndSetCookie(user.id, res);

    res.status(200).json({
      status: "success",
      data: {
        user: mapAuthUser(user),
        token: authToken,
      },
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ error: "Google authentication failed" });
  }
};

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

module.exports = { register, login, googleAuth, logout };