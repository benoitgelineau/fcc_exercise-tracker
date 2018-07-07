const User = require("../models/user");
const Exercise = require("../models/exercise");
// const async = require("async");
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
    .isAlphanumeric()
    .withMessage("Description must be specified."),
  body("duration")
    .isLength({ min: 1 })
    .trim()
    .isAlphanumeric()
    .withMessage("Duration must be specified."),
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
        const exercise = new Exercise({
          user: result._id,
          description: req.body.description,
          duration: req.body.duration,
          date: req.body.date
        });

        exercise.save(function(err) {
          if (err) {
            return next(err);
          }
          // Successful - send new user record in json format.
          // res.json({ _id: result._id });
        });
      })
    }
  }
];