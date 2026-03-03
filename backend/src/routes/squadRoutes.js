const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/squadController");

router.get("/state", auth, ctrl.getSquadState);
router.put("/state", auth, ctrl.saveSquadState);
router.get("/requests", auth, ctrl.getConnectionRequests);
router.post("/connect-request", auth, ctrl.sendConnectionRequest);
router.post("/requests/:requestId/respond", auth, ctrl.respondToConnectionRequest);
router.post("/dm/start", auth, ctrl.startDirectMessage);
router.post("/messages", auth, ctrl.sendDirectMessage);

module.exports = router;
