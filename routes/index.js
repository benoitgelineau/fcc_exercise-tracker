const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const exercise_controller = require("../controllers/exerciseController");

// POST request for creating new user
router.post('/new-user', user_controller.user_create_post);

// POST request for creating new exercises
router.post("/add", exercise_controller.exercise_create_post);

// GET exercises
router.get("/log?:userid:from:to:limit", user_controller.user_log_get);

module.exports = router;
