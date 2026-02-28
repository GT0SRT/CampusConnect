const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/threadController");

router.post("/create", auth, ctrl.createThread);
router.get("/", ctrl.getThreads);
router.post("/vote", auth, ctrl.voteThread);

router.post("/save", auth, ctrl.saveThread);
router.post("/unsave", auth, ctrl.unsaveThread);
router.get("/saved", auth, ctrl.getSavedThreads);
router.get("/mythreads", auth, ctrl.getMyThreads);
router.get("/:threadId", ctrl.getThreadById);
router.delete("/:threadId", auth, ctrl.deleteThread);


module.exports = router;
