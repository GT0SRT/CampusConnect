const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/assesmentController");

router.post("/", auth, ctrl.addAssessmentRecord);
router.get("/", auth, ctrl.getAssessments);

module.exports = router;