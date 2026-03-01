const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

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
      return res
        .status(400)
        .json({ error: "all fields are required" });
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
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
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
      return res
        .status(400)
        .json({ error: "Username already taken. Try another username" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with default empty fields
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
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

    // Generate JWT
    const token = generateToken(user.id);

    res.status(201).json({
      status: "success",
      data: {
        user: mapAuthUser(user),
        token,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      const conflictField = Array.isArray(error.meta?.target)
        ? error.meta.target[0]
        : error.meta?.target;

      if (conflictField === "email") {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      if (conflictField === "username") {
        return res.status(400).json({ error: "Username already taken. Try another username" });
      }

      return res.status(400).json({ error: "Duplicate user details found" });
    }

    if (error.code === "P2022") {
      return res.status(500).json({
        error: "Database schema is out of sync. Run prisma migration and restart backend.",
      });
    }

    if (error.name === "PrismaClientValidationError") {
      return res.status(500).json({
        error: "Invalid user payload for current database schema. Update controller fields to match Prisma model.",
      });
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

    // Check if user exists by email or username
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

    // verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username/email or password" });
    }

    const token = generateToken(user.id);

    res.status(201).json({
      status: "success",
      data: {
        user: mapAuthUser(user),
        token,
      },
    });
  } catch (error) {
    if (error.code === "P2022") {
      return res.status(500).json({
        error: "Database schema is out of sync. Run prisma migration and restart backend.",
      });
    }

    return res.status(500).json({ error: "Login failed. Please try again." });
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

module.exports = { register, login, logout };