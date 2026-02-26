const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/profileController");

router.get("/", auth, ctrl.getProfile);
router.put("/", auth, ctrl.updateProfile);
router.get("/karma", auth, ctrl.getKarma);
router.post("/save", auth, ctrl.savePost);
router.get("/saved", auth, ctrl.getSavedPosts);
router.get("/myposts", auth, ctrl.getMyPosts);
router.get("/savedthreads", auth, ctrl.getSavedThreads);

router.post("/like", auth, ctrl.likePost);
router.post("/comment", auth, ctrl.addComment);
router.get("/stats", auth, ctrl.getProfileStats);




module.exports = router;
