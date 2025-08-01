const mongoose = require('mongoose');

const announceChannelSchema = new mongoose.Schema({
  discord_id: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    Kick: {
      channel: { type: String },
      notificado: { type: Boolean, default: false }
    },
    Twitch: {
      channel: { type: String },
      notificado: { type: Boolean, default: false }
    }
  }
});

module.exports = mongoose.model('AnnounceChannels', announceChannelSchema, 'AnnounceChannels');
