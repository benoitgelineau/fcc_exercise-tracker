const mongoose = require("mongoose");
const shortid = require("shortid");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    _id: {
      type: String,
      default: shortid.generate
    },
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