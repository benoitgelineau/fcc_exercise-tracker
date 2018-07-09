const User = require("../models/user");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

exports.user_create_post = [
  // Validate fields.
  body("username")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Username must be specified."),

  // Sanitize fields.
  sanitizeBody("username")
    .trim()
    .escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(422).json({ errors: errors.array() });
      return;
    } else {
      // Data from form is valid.

      // Create an Author object with escaped and trimmed data.
      const user = new User({
        name: req.body.username
      });
      user.save(function(err) {
        if (err) {
          return next(err);
        }
        // Successful - send new user record in json format.
        res.json({ username: user.name, id: user.id });
      });
    }
  }
];
