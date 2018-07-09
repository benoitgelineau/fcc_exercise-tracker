const User = require("../models/user");
const Exercise = require("../models/exercise");
const moment = require('moment');
const async = require('async');
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

exports.exercise_create_post = [
  // Validate fields.
  body("userId")
    .isLength({ min: 1 })
    .trim()
    .isAlphanumeric()
    .withMessage("User ID must be specified."),
  body("description")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Description must be specified."),
  body("duration")
    .isLength({ min: 1 })
    .trim()
    .isInt({ min: 1 })
    .withMessage("Duration must be a specified positive number."),
  body("date", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields.
  sanitizeBody("userId")
    .trim()
    .escape(),
  sanitizeBody("description")
    .trim()
    .escape(),
  sanitizeBody("duration")
    .trim()
    .escape(),
  sanitizeBody("date").toDate(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(422).json({ errors: errors.array() });
      return;
    } else {
      // Data from form is valid.

      User.findById(req.body.userId).exec(function (err, result) {
        if (err) return next(err);
        if (result == null) { // No result
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        // Success
        // Create an Exercise object with escaped and trimmed data.
        if (req.body.date) {
          var exercise = new Exercise({
            user: result,
            description: req.body.description,
            duration: req.body.duration,
            date: req.body.date
          });
        } else {
          var exercise = new Exercise({
            user: result,
            description: req.body.description,
            duration: req.body.duration
          });
        }

        exercise.save(function(err) {
          if (err) {
            return next(err);
          }
          // Successful - send new exercise record in json format.
          res.json({ 
            id: exercise.user.id,
            username: exercise.user.name,
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date_formatted
          });
        });
      })
    }
  }
];

exports.exercise_get = (req, res, next) => {
  
  const parseDate = date => moment(date).format("D MMMM YYYY"); // Same as virtual date_formatted

  const from_date = new Date(req.query.from);
  const to_date = new Date(req.query.to);
  const limit = parseInt(req.query.limit);

  async.parallel(
    {
      user: function(callback) {
        User.findById(req.query.userId).exec(callback);
      },
      exercises: function(callback) {
        Exercise.find({ user: req.query.userId })
          .sort({ date: "desc" })
          .where('date').gt(from_date).lt(to_date)
          .limit(limit)
          .select("description duration date -_id")
          .exec(callback);
      },
      count: function(callback) {
        Exercise.count({ user: req.query.userId }, callback);
      }
    }, function(err, results) {

      if (err) {
        return next(err);
      }
      if (results == null) {
        const err = new Error("User not found");
        err.status = 404;
        return next(err);
      }

      // Array to format date (date_formatted cannot be used in query above)
      const exercisesArray = [];
      const length = results.exercises.length;

      for (let i = 0; i < length; i++) {
        exercisesArray.push({ 
          description: results.exercises[i].description, 
          duration: results.exercises[i].duration, 
          date: parseDate(results.exercises[i].date) });
      }

      res.json(
        {
          _id: results.user._id,
          username: results.user.name,
          count: length,
          log: exercisesArray
        }
    );
    }
  );
};
