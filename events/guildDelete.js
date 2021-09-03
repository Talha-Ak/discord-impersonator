const { Guild } = require('discord.js');

/**
 * All data associated with the bot is deleted.
 * @param {Guild} guild
 */
const execute = async (guild) => {
    await guild.client.deleteGuildInDb(guild);

    console.log(`Guild ${guild.name} | ${guild.id} removed.`);
};

/**
 * Event when the bot is removed from the guild.
 */
module.exports = {
    name: 'guildDelete',
    execute,
};
