const { Client, Message } = require('discord.js');
const tools = require('../tools');

/**
 * Deletes a welcome message associated with the guild.
 * Command format: impdel <number>
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    // Show usage info if no arg provided.
    if (!args[0]) {
        message.channel.send(`Usage: ${guildInfo.prefix}ImpDel \`number\` | Use ${guildInfo.prefix}ImpList to see message numbers.`);
        return;
    }

    if (guildInfo.welcomeMsgs && guildInfo.welcomeMsgs.length >= args[0]) {

        // Remove message from array and save new array to db.
        const deletedMsg = guildInfo.welcomeMsgs.splice(args[0] - 1, 1);
        await client.updateGuildInDb(message.guild, guildInfo);

        message.channel.send(`Welcome message #${args[0]} was deleted: \`${deletedMsg[0]}\``);
        client.commands.get('implist').run(client, message, '', guildInfo);

        tools.sendToLogs(client, `Removed welcome message \`${deletedMsg[0]}\` from ${message.guild.name}`);
        console.log(`Removed welcome message to ${message.guild.name}`);
    } else {
        message.channel.send(`Welcome message number #\`${args[0]}\` does not exist.`);
    }
};
