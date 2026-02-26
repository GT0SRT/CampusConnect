const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/postController");

router.post("/add", auth, ctrl.addPost);
router.post("/save", auth, ctrl.savePost);
router.get("/saved", auth, ctrl.getSavedPosts);
router.delete("/:postId", auth, ctrl.deletePost);

module.exports = router;
