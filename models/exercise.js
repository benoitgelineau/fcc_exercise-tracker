const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
);

ExerciseSchema
  .virtual("date_formatted")
  .get(function() {
    return this.date ? moment(this.date).format("YYYY-MM-DD") : "";
  });

//Export model
module.exports = mongoose.model("Exercise", ExerciseSchema);
