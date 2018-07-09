const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      max: 60,
      required: true
    }
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);
