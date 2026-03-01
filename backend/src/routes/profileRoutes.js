const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/profileController");

router.get("/public/:username", ctrl.getPublicProfile);

router.get("/me", auth, ctrl.getProfile);
router.put("/me", auth, ctrl.updateProfile);
router.get("/discover", auth, ctrl.getDiscoverProfiles);

router.get("/", auth, ctrl.getProfile);
router.put("/", auth, ctrl.updateProfile);

router.get("/education", auth, ctrl.getEducation);
router.post("/education", auth, ctrl.addEducation);
router.put("/education/:educationId", auth, ctrl.updateEducation);
router.delete("/education/:educationId", auth, ctrl.deleteEducation);

router.get("/experience", auth, ctrl.getExperience);
router.post("/experience", auth, ctrl.addExperience);
router.put("/experience/:experienceId", auth, ctrl.updateExperience);
router.delete("/experience/:experienceId", auth, ctrl.deleteExperience);

router.get("/skills", auth, ctrl.getSkills);
router.post("/skills", auth, ctrl.addSkill);
router.put("/skills/:skillId", auth, ctrl.updateSkill);
router.delete("/skills/:skillId", auth, ctrl.deleteSkill);

router.get("/interests", auth, ctrl.getInterests);
router.post("/interests", auth, ctrl.addInterest);
router.put("/interests/:interestId", auth, ctrl.updateInterest);
router.delete("/interests/:interestId", auth, ctrl.deleteInterest);

router.get("/projects", auth, ctrl.getProjects);
router.post("/projects", auth, ctrl.addProject);
router.put("/projects/:projectId", auth, ctrl.updateProject);
router.delete("/projects/:projectId", auth, ctrl.deleteProject);

router.get("/karma", auth, ctrl.getKarma);
router.post("/save", auth, ctrl.savePost);
router.get("/saved", auth, ctrl.getSavedPosts);
router.get("/myposts", auth, ctrl.getMyPosts);
router.get("/savedthreads", auth, ctrl.getSavedThreads);

router.post("/like", auth, ctrl.likePost);
router.post("/comment", auth, ctrl.addComment);

router.get("/stats", auth, ctrl.getProfileStats);

module.exports = router;
