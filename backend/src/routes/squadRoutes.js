const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/squadController");

router.get("/state", auth, ctrl.getSquadState);
router.put("/state", auth, ctrl.saveSquadState);

module.exports = router;
