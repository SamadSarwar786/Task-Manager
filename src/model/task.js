const { Schema, default: mongoose } = require("mongoose");

const schema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref : 'User',
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", schema);

module.exports = Task;
