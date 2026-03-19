const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    youtubeLink: { type: String, required: true },
    guest: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Podcast', podcastSchema);

