const prisma = require("../lib/prisma");
const { randomUUID } = require("crypto");

const PROFILE_UPDATABLE_FIELDS = new Set([
  "username",
  "fullName",
  "profileImageUrl",
  "collegeName",
  "headline",
  "about",
  "tags",
  "skills",
  "interests",
  "socialLinks",
  "education",
  "experience",
  "projects",
]);

const toNonEmptyString = (value) => String(value || "").trim();

const hasNonEmptyString = (value) => toNonEmptyString(value).length > 0;

const hasArrayData = (value) => Array.isArray(value) && value.length > 0;

const hasObjectData = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).some((item) => hasNonEmptyString(item));
};

const toTrimmedString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return toTrimmedString(item.name || item.title || item.value || item.label);
      }

      return toTrimmedString(item);
    })
    .filter((item) => item.length > 0);
};

const toSocialLinks = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value)
    .map(([key, url]) => [toTrimmedString(key).toLowerCase(), toTrimmedString(url)])
    .filter(([key, url]) => key.length > 0 && url.length > 0);

  return Object.fromEntries(entries);
};

const sanitizeJsonValue = (value) => {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return null;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeJsonValue(entry))
      .filter((entry) => entry !== null);
  }

  if (typeof value === "object") {
    const normalizedEntries = Object.entries(value)
      .map(([key, entry]) => [key, sanitizeJsonValue(entry)])
      .filter(([, entry]) => entry !== null);

    return Object.fromEntries(normalizedEntries);
  }

  return null;
};

const toJsonArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return sanitizeJsonValue(value);
};

const parseYear = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const hasEducationContent = (entry = {}) => {
  return [entry.collegeName, entry.institution, entry.branch, entry.degree, entry.stream]
    .map((item) => toTrimmedString(item))
    .some((item) => item.length > 0);
};

const normalizeEducationEntry = (entry = {}, fallbackId) => {
  const collegeName = toTrimmedString(entry.collegeName || entry.institution);
  const branch = toTrimmedString(entry.branch || entry.degree || entry.stream);
  const fromYear = parseYear(entry.fromYear);
  const toYear = parseYear(entry.toYear);

  if (!hasEducationContent(entry)) {
    return null;
  }

  return {
    id: toTrimmedString(entry.id) || fallbackId || randomUUID(),
    collegeName,
    branch,
    fromYear,
    toYear,
  };
};

const normalizeEducationList = (education) => {
  if (!Array.isArray(education)) {
    return [];
  }

  return education.map((entry) => normalizeEducationEntry(entry)).filter(Boolean);
};

const normalizeNamedEntry = (entry = {}, fallbackId) => {
  const name = toTrimmedString(entry.name || entry.title || entry.label || entry.value);

  if (!name) {
    return null;
  }

  return {
    id: toTrimmedString(entry.id) || fallbackId || randomUUID(),
    name,
  };
};

const normalizeNamedList = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string") {
        return normalizeNamedEntry({ name: item });
      }

      return normalizeNamedEntry(item);
    })
    .filter(Boolean);
};

const normalizeProjectEntry = (entry = {}, fallbackId) => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }

  const techStack = Array.isArray(entry.techStack)
    ? toStringArray(entry.techStack)
    : toStringArray(String(entry.techStack || "").split(","));

  const liveLink = toTrimmedString(entry.liveLink || entry.link || entry.url);

  const normalized = {
    id: toTrimmedString(entry.id) || fallbackId || randomUUID(),
    title: toTrimmedString(entry.title || entry.name),
    description: toTrimmedString(entry.description),
    liveLink,
    link: liveLink,
    techStack,
  };

  if (!normalized.title && !normalized.description && !normalized.liveLink && techStack.length === 0) {
    return null;
  }

  return normalized;
};

const normalizeProjectList = (projects) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects.map((project) => normalizeProjectEntry(project)).filter(Boolean);
};

const normalizeExperienceEntry = (entry = {}, fallbackId) => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }

  const normalized = {
    id: toTrimmedString(entry.id) || fallbackId || randomUUID(),
    role: toTrimmedString(entry.role || entry.title),
    title: toTrimmedString(entry.title || entry.role),
    company: toTrimmedString(entry.company || entry.organization),
    description: toTrimmedString(entry.description),
    fromYear: parseYear(entry.fromYear),
    toYear: parseYear(entry.toYear),
  };

  if (!normalized.title && !normalized.company && !normalized.description) {
    return null;
  }

  return normalized;
};

const normalizeExperienceList = (experience) => {
  if (!Array.isArray(experience)) {
    return [];
  }

  return experience.map((item) => normalizeExperienceEntry(item)).filter(Boolean);
};

const decodePathId = (value) => {
  const raw = toTrimmedString(value);

  if (!raw) {
    return "";
  }

  try {
    return decodeURIComponent(raw);
  } catch (_) {
    return raw;
  }
};

const upsertUserArrayField = async (user, fieldName, nextValue) => {
  const profileCompletePercentage = calculateCompletionForUpdatedUser(user, {
    [fieldName]: nextValue,
  });

  return prisma.user.update({
    where: { id: user.id },
    data: {
      [fieldName]: nextValue,
      profileCompletePercentage,
    },
    select: { [fieldName]: true },
  });
};

const calculateCompletionForUpdatedUser = (user, partialUpdate) => {
  const mergedUser = { ...user, ...partialUpdate };
  return calculateProfileCompletePercentage(mergedUser);
};

const buildProfileUpdateData = (payload = {}) => {
  const data = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!PROFILE_UPDATABLE_FIELDS.has(key)) {
      continue;
    }

    if (key === "username") {
      const username = toTrimmedString(value);

      if (!username) {
        throw new Error("username cannot be empty");
      }

      data.username = username;
      continue;
    }

    if (["fullName", "profileImageUrl", "collegeName", "headline", "about"].includes(key)) {
      data[key] = toTrimmedString(value);
      continue;
    }

    if (["tags", "skills", "interests"].includes(key)) {
      data[key] = toStringArray(value);
      continue;
    }

    if (key === "socialLinks") {
      data.socialLinks = toSocialLinks(value);
      continue;
    }

    if (key === "education") {
      data.education = normalizeEducationList(value);
      continue;
    }

    if (key === "experience") {
      data.experience = normalizeExperienceList(value);
      continue;
    }

    if (key === "projects") {
      data.projects = normalizeProjectList(value);
    }
  }

  return data;
};

const calculateProfileCompletePercentage = (user) => {
  const checks = [
    hasNonEmptyString(user.fullName),
    hasNonEmptyString(user.collegeName),
    hasNonEmptyString(user.headline),
    hasNonEmptyString(user.about),
    hasArrayData(user.tags),
    hasArrayData(user.skills),
    hasArrayData(user.interests),
    hasObjectData(user.socialLinks),
    hasArrayData(user.education),
    hasArrayData(user.experience),
    hasArrayData(user.projects),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const sanitizeUser = (user) => ({
  id: user.id,
  uid: user.id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  profileImageUrl: user.profileImageUrl,
  collegeName: user.collegeName,
  headline: user.headline,
  about: user.about,
  tags: user.tags,
  skills: user.skills,
  interests: user.interests,
  socialLinks: user.socialLinks,
  education: user.education,
  experience: user.experience,
  projects: user.projects,
  profileCompletePercentage: user.profileCompletePercentage ?? 0,
  createdAt: user.createdAt,
});

const sanitizePublicUser = (user) => ({
  id: user.id,
  uid: user.id,
  username: user.username,
  fullName: user.fullName,
  profileImageUrl: user.profileImageUrl,
  collegeName: user.collegeName,
  headline: user.headline,
  about: user.about,
  tags: user.tags,
  skills: user.skills,
  interests: user.interests,
  socialLinks: user.socialLinks,
  education: user.education,
  experience: user.experience,
  projects: user.projects,
  profileCompletePercentage: user.profileCompletePercentage ?? 0,
  createdAt: user.createdAt,
});

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const username = toTrimmedString(req.params.username).toLowerCase();

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(sanitizePublicUser(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    let data;

    try {
      data = buildProfileUpdateData(req.body);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const safeData = Object.fromEntries(
      Object.entries({
        ...data,
        ...(data.tags ? { tags: toStringArray(data.tags) } : {}),
        ...(data.skills ? { skills: toStringArray(data.skills) } : {}),
        ...(data.interests ? { interests: toStringArray(data.interests) } : {}),
        ...(data.socialLinks ? { socialLinks: toSocialLinks(data.socialLinks) } : {}),
        ...(data.education ? { education: normalizeEducationList(data.education) } : {}),
        ...(data.experience ? { experience: normalizeExperienceList(data.experience) } : {}),
        ...(data.projects ? { projects: normalizeProjectList(data.projects) } : {}),
      }).filter(([, value]) => value !== undefined)
    );

    const mergedUser = { ...existingUser, ...safeData };
    const profileCompletePercentage = calculateProfileCompletePercentage(mergedUser);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...safeData,
        profileCompletePercentage,
      },
    });

    res.json(sanitizeUser(user));
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Username already taken. Try another username" });
    }

    if (error.name === "PrismaClientValidationError") {
      return res.status(400).json({ error: "Invalid profile payload. Check interests/projects format." });
    }

    res.status(500).json({ error: error.message });
  }
};

// ================= EDUCATION =================

exports.getEducation = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { education: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const education = normalizeEducationList(user.education || []);
    res.json(education);
  } catch (error) {
    if (error.message?.includes("required") || error.message?.includes("cannot")) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

exports.addEducation = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newEducationEntry = normalizeEducationEntry(req.body);

    if (!newEducationEntry) {
      return res.status(400).json({ error: "At least one education field is required" });
    }

    const existingEducation = Array.isArray(user.education) ? user.education : [];
    const education = [...existingEducation, newEducationEntry];

    const profileCompletePercentage = calculateCompletionForUpdatedUser(user, { education });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { education, profileCompletePercentage },
      select: { education: true },
    });

    return res.status(201).json({
      message: "Education added",
      education: updatedUser.education,
      item: newEducationEntry,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const educationId = toTrimmedString(req.params.educationId);

    if (!educationId) {
      return res.status(400).json({ error: "educationId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentEducation = Array.isArray(user.education) ? user.education : [];
    const targetIndex = currentEducation.findIndex(
      (entry) => toTrimmedString(entry?.id) === educationId
    );

    if (targetIndex === -1) {
      return res.status(404).json({ error: "Education item not found" });
    }

    const updatedEntry = normalizeEducationEntry(
      { ...currentEducation[targetIndex], ...req.body, id: educationId },
      educationId
    );

    if (!updatedEntry) {
      return res.status(400).json({ error: "Education data cannot be empty" });
    }

    const education = [...currentEducation];
    education[targetIndex] = updatedEntry;

    const profileCompletePercentage = calculateCompletionForUpdatedUser(user, { education });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { education, profileCompletePercentage },
      select: { education: true },
    });

    return res.json({
      message: "Education updated",
      education: updatedUser.education,
      item: updatedEntry,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const educationId = toTrimmedString(req.params.educationId);

    if (!educationId) {
      return res.status(400).json({ error: "educationId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentEducation = Array.isArray(user.education) ? user.education : [];
    const nextEducation = currentEducation.filter(
      (entry) => toTrimmedString(entry?.id) !== educationId
    );

    if (nextEducation.length === currentEducation.length) {
      return res.status(404).json({ error: "Education item not found" });
    }

    const profileCompletePercentage = calculateCompletionForUpdatedUser(user, {
      education: nextEducation,
    });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { education: nextEducation, profileCompletePercentage },
      select: { education: true },
    });

    return res.json({
      message: "Education deleted",
      education: updatedUser.education,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// =========== EXPERIENCE ================
exports.getExperience = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { experience: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const experience = normalizeExperienceList(user.experience || []);
    return res.json(experience);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addExperience = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newExperience = normalizeExperienceEntry(req.body);

    if (!newExperience) {
      return res.status(400).json({ error: "At least one experience field is required" });
    }

    const currentExperience = normalizeExperienceList(user.experience || []);
    const experience = [...currentExperience, newExperience];
    const updatedUser = await upsertUserArrayField(user, "experience", experience);

    return res.status(201).json({
      message: "Experience added",
      experience: updatedUser.experience,
      item: newExperience,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const experienceId = toTrimmedString(req.params.experienceId);

    if (!experienceId) {
      return res.status(400).json({ error: "experienceId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentExperience = normalizeExperienceList(user.experience || []);
    const targetIndex = currentExperience.findIndex(
      (entry) => toTrimmedString(entry?.id) === experienceId
    );

    if (targetIndex === -1) {
      return res.status(404).json({ error: "Experience item not found" });
    }

    const updatedEntry = normalizeExperienceEntry(
      { ...currentExperience[targetIndex], ...req.body, id: experienceId },
      experienceId
    );

    if (!updatedEntry) {
      return res.status(400).json({ error: "Experience data cannot be empty" });
    }

    const experience = [...currentExperience];
    experience[targetIndex] = updatedEntry;

    const updatedUser = await upsertUserArrayField(user, "experience", experience);

    return res.json({
      message: "Experience updated",
      experience: updatedUser.experience,
      item: updatedEntry,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const experienceId = toTrimmedString(req.params.experienceId);

    if (!experienceId) {
      return res.status(400).json({ error: "experienceId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentExperience = normalizeExperienceList(user.experience || []);
    const nextExperience = currentExperience.filter(
      (entry) => toTrimmedString(entry?.id) !== experienceId
    );

    if (nextExperience.length === currentExperience.length) {
      return res.status(404).json({ error: "Experience item not found" });
    }

    const updatedUser = await upsertUserArrayField(user, "experience", nextExperience);

    return res.json({
      message: "Experience deleted",
      experience: updatedUser.experience,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSkills = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { skills: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(toStringArray(user.skills || []));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addSkill = async (req, res) => {
  try {
    const skillName = toTrimmedString(req.body?.name || req.body?.skill || req.body?.value);

    if (!skillName) {
      return res.status(400).json({ error: "Skill name is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentSkills = toStringArray(user.skills || []);
    const skillSet = new Set(currentSkills.map((item) => item.toLowerCase()));

    if (!skillSet.has(skillName.toLowerCase())) {
      currentSkills.push(skillName);
    }

    const updatedUser = await upsertUserArrayField(user, "skills", currentSkills);
    return res.status(201).json({ message: "Skill added", skills: updatedUser.skills });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const skillId = decodePathId(req.params.skillId).toLowerCase();
    const nextSkill = toTrimmedString(req.body?.name || req.body?.skill || req.body?.value);

    if (!skillId || !nextSkill) {
      return res.status(400).json({ error: "skillId and next skill value are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentSkills = toStringArray(user.skills || []);
    const targetIndex = currentSkills.findIndex((item) => item.toLowerCase() === skillId);

    if (targetIndex === -1) {
      return res.status(404).json({ error: "Skill not found" });
    }

    currentSkills[targetIndex] = nextSkill;
    const deduped = Array.from(new Map(currentSkills.map((item) => [item.toLowerCase(), item])).values());

    const updatedUser = await upsertUserArrayField(user, "skills", deduped);
    return res.json({ message: "Skill updated", skills: updatedUser.skills });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const skillId = decodePathId(req.params.skillId).toLowerCase();

    if (!skillId) {
      return res.status(400).json({ error: "skillId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentSkills = toStringArray(user.skills || []);
    const nextSkills = currentSkills.filter((item) => item.toLowerCase() !== skillId);

    if (nextSkills.length === currentSkills.length) {
      return res.status(404).json({ error: "Skill not found" });
    }

    const updatedUser = await upsertUserArrayField(user, "skills", nextSkills);
    return res.json({ message: "Skill deleted", skills: updatedUser.skills });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getInterests = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { interests: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(toStringArray(user.interests || []));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addInterest = async (req, res) => {
  try {
    const interestName = toTrimmedString(req.body?.name || req.body?.interest || req.body?.value);

    if (!interestName) {
      return res.status(400).json({ error: "Interest name is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentInterests = toStringArray(user.interests || []);
    const interestSet = new Set(currentInterests.map((item) => item.toLowerCase()));

    if (!interestSet.has(interestName.toLowerCase())) {
      currentInterests.push(interestName);
    }

    const updatedUser = await upsertUserArrayField(user, "interests", currentInterests);
    return res.status(201).json({ message: "Interest added", interests: updatedUser.interests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateInterest = async (req, res) => {
  try {
    const interestId = decodePathId(req.params.interestId).toLowerCase();
    const nextInterest = toTrimmedString(req.body?.name || req.body?.interest || req.body?.value);

    if (!interestId || !nextInterest) {
      return res.status(400).json({ error: "interestId and next interest value are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentInterests = toStringArray(user.interests || []);
    const targetIndex = currentInterests.findIndex((item) => item.toLowerCase() === interestId);

    if (targetIndex === -1) {
      return res.status(404).json({ error: "Interest not found" });
    }

    currentInterests[targetIndex] = nextInterest;
    const deduped = Array.from(new Map(currentInterests.map((item) => [item.toLowerCase(), item])).values());

    const updatedUser = await upsertUserArrayField(user, "interests", deduped);
    return res.json({ message: "Interest updated", interests: updatedUser.interests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteInterest = async (req, res) => {
  try {
    const interestId = decodePathId(req.params.interestId).toLowerCase();

    if (!interestId) {
      return res.status(400).json({ error: "interestId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentInterests = toStringArray(user.interests || []);
    const nextInterests = currentInterests.filter((item) => item.toLowerCase() !== interestId);

    if (nextInterests.length === currentInterests.length) {
      return res.status(404).json({ error: "Interest not found" });
    }

    const updatedUser = await upsertUserArrayField(user, "interests", nextInterests);
    return res.json({ message: "Interest deleted", interests: updatedUser.interests });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { projects: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(normalizeProjectList(user.projects || []));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addProject = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newProject = normalizeProjectEntry(req.body);

    if (!newProject) {
      return res.status(400).json({ error: "At least one project field is required" });
    }

    const currentProjects = normalizeProjectList(user.projects || []);
    const projects = [...currentProjects, newProject];
    const updatedUser = await upsertUserArrayField(user, "projects", projects);

    return res.status(201).json({
      message: "Project added",
      projects: updatedUser.projects,
      item: newProject,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const projectId = toTrimmedString(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentProjects = normalizeProjectList(user.projects || []);
    const targetIndex = currentProjects.findIndex(
      (entry) => toTrimmedString(entry?.id) === projectId
    );

    if (targetIndex === -1) {
      return res.status(404).json({ error: "Project item not found" });
    }

    const updatedEntry = normalizeProjectEntry(
      { ...currentProjects[targetIndex], ...req.body, id: projectId },
      projectId
    );

    if (!updatedEntry) {
      return res.status(400).json({ error: "Project data cannot be empty" });
    }

    const projects = [...currentProjects];
    projects[targetIndex] = updatedEntry;

    const updatedUser = await upsertUserArrayField(user, "projects", projects);

    return res.json({
      message: "Project updated",
      projects: updatedUser.projects,
      item: updatedEntry,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = toTrimmedString(req.params.projectId);

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentProjects = normalizeProjectList(user.projects || []);
    const nextProjects = currentProjects.filter(
      (entry) => toTrimmedString(entry?.id) !== projectId
    );

    if (nextProjects.length === currentProjects.length) {
      return res.status(404).json({ error: "Project item not found" });
    }

    const updatedUser = await upsertUserArrayField(user, "projects", nextProjects);

    return res.json({
      message: "Project deleted",
      projects: updatedUser.projects,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getKarma = async (req, res) => {
  try {
    const userId = req.user.id;

    const likes = await prisma.postLike.count({
      where: { post: { authorId: userId } },
    });

    const comments = await prisma.comment.count({
      where: { post: { authorId: userId } },
    });

    return res.json({ karma: likes + comments });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.body || {};

    if (!toTrimmedString(postId)) {
      return res.status(400).json({ error: "postId is required" });
    }

    const saved = await prisma.savedPost.create({
      data: {
        userId: req.user.id,
        postId,
      },
    });

    return res.json(saved);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Post is already saved" });
    }

    return res.status(500).json({ error: error.message });
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

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: req.user.id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSavedThreads = async (req, res) => {
  try {
    const saved = await prisma.savedThread.findMany({
      where: { userId: req.user.id },
      include: {
        thread: true,
      },
    });

    return res.json(saved);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.body || {};

    if (!toTrimmedString(postId)) {
      return res.status(400).json({ error: "postId is required" });
    }

    await prisma.postLike.create({
      data: {
        userId: req.user.id,
        postId,
      },
    });

    return res.json({ message: "Liked" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Post is already liked" });
    }

    return res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId, threadId, content, parentId } = req.body || {};

    if (!toTrimmedString(content)) {
      return res.status(400).json({ error: "content is required" });
    }

    if (!toTrimmedString(postId) && !toTrimmedString(threadId)) {
      return res.status(400).json({ error: "postId or threadId is required" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        ...(toTrimmedString(postId) ? { postId } : {}),
        ...(toTrimmedString(threadId) ? { threadId } : {}),
        ...(toTrimmedString(parentId) ? { parentId } : {}),
      },
    });

    return res.json(comment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ================= PROFILE STATS (IMPORTANT) =================

// Posts / Threads / Saved / Karma counts
exports.getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const postsCount = await prisma.post.count({
      where: { authorId: userId }
    });

    const threadsCount = await prisma.thread.count({
      where: { authorId: userId }
    });

    const savedCount = await prisma.savedPost.count({
      where: { userId }
    });

    const likes = await prisma.postLike.count({
      where: { post: { authorId: userId } }
    });

    const comments = await prisma.comment.count({
      where: { post: { authorId: userId } }
    });

    const karma = likes + comments;

    res.json({
      posts: postsCount,
      threads: threadsCount,
      saved: savedCount,
      karma
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
