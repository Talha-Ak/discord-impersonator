const mongoose = require('mongoose');
const { defaultSettings: defaults } = require('../config');

/**
 * This is the schema ("model") of a guild, and defines what information the db holds on each guild.
 */
const guildSchema = new mongoose.Schema({
    guildID: String,
    webhookID: String,
    roleID: String,
    prefix: {
        type: String,
        default: defaults.prefix,
    },
    welcomeMsgs: {
        type: [String],
        default: defaults.welcomeMsgs,
    },
    schemaVersion: {
        type: Number,
        default: defaults.schemaVersion,
    },
});

module.exports = mongoose.model('Guild', guildSchema);
