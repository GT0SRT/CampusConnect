const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/threadController");

router.post("/create", auth, ctrl.createThread);
router.get("/", ctrl.getThreads);

router.post("/vote", auth, ctrl.voteThread);

router.post("/save", auth, ctrl.saveThread);
router.get("/saved",auth, ctrl.getSavedThreads);
router.get("/mythreads", auth, ctrl.getMyThreads);


module.exports = router;
