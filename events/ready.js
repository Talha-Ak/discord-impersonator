const { Client } = require('discord.js');

/**
 * Log when the bot is connected to Discord's servers.
 * @param {Client} client
 */
module.exports = client => {
    client.user.setActivity('for .imphelp', { type: 'WATCHING' });
    console.log(`Ready! Logged in as ${client.user.tag}`);
};
