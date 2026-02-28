const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/interviewController");

router.post("/", auth, ctrl.addInterviewRecord);
router.get("/", auth, ctrl.getMyInterviewRecords);

module.exports = router;
