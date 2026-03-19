const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['upcoming', 'past'],
      required: true,
    },
    images: [{ type: String }],
    speakers: [{ type: String }],
    registrationLink: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);

