require('dotenv-flow').config();

// This file holds default values and constants used.
module.exports = {
    // token inside .env file
    token: process.env.TOKEN,
    logJoinsChannel: '',
    logChannel: '',
    inviteLink: '',
    webhookName: '',
    webhookAvatar: '',
    owners: [''],
    defaultSettings: {
        // prefix inside .env file
        prefix: process.env.PREFIX,
        welcomeMsgs: ['Hello!'],
        schemaVersion: 1,
    },
};
