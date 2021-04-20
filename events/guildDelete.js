const { Client, Guild } = require('discord.js');
const tools = require('../tools');

/**
 * This runs when the bot is removed from the guild. All data associated with the bot is deleted.
 * @param {Client} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {

    await client.deleteGuildInDb(guild);

    tools.sendToJoins(client, `Removed from ${guild.name} | ${guild.id}`);
    console.log(`Guild ${guild.name} | ${guild.id} removed.`);
};
