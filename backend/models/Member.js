const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    tenure: { type: String, required: true },
    image: { type: String },
    linkedin: { type: String },
    isCurrent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Member', memberSchema);

