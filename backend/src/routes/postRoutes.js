const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/postController");

router.post("/add", auth, ctrl.addPost);
router.post("/save", auth, ctrl.savePost);
router.post("/unsave", auth, ctrl.DeleteSavedPost);
router.get("/saved", auth, ctrl.getSavedPosts);
router.delete("/:postId", auth, ctrl.deletePost);
router.post("/like", auth, ctrl.likePost);
router.post("/unlike", auth, ctrl.unlikePost);
router.post("/comment", auth, ctrl.addComment);
router.get("/comments/:postId", auth, ctrl.getComments);
router.delete("/comment/:commentId", auth, ctrl.deleteComment);
router.get("/posts", auth, ctrl.getAllPosts);

module.exports = router;