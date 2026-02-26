const router = require("express").Router();

router.get("/test", (req, res) => {
  res.json({ msg: "Auth working" });
});

module.exports = router;
