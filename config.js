require('dotenv').config();

// This file holds default values and constants used.
module.exports = {
    token: process.env.DISCORD_TOKEN,
    inviteLink: 'https://discord.com/oauth2/authorize?client_id=749282568733458545&permissions=537160768&scope=bot%20applications.commands',
    webhookName: 'Impersonator Webhook',
    webhookAvatar: '',
    owners: ['123456789', '987654321'],
    defaultSettings: {
        welcomeMsgs: ['Hello!'],
        schemaVersion: 1,
    },
};
