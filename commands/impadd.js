const { Client, Message } = require('discord.js');
const tools = require('../tools');

/**
 * Takes the message after this command and persists it to that guild's entry in the db.
 * Command format: impadd <message>
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    // Check if guild exceeded their 20 character limit.
    if (guildInfo.welcomeMsgs.length >= 20) {
        message.channel.send('You cannot add any more mesages. (20 message limit)');
        client.commands.get('implist').run(client, message, '');
        return;
    }

    // If no message given, show usage info.
    const newWelcome = args.join(' ');
    if (newWelcome.length < 1) {
        return message.channel.send(`Usage: ${guildInfo.prefix}impadd \`message\``);
    }

    // Persist the message to the db and send a reaction indicating so.
    guildInfo.welcomeMsgs.push(newWelcome);
    await client.updateGuildInDb(message.guild, guildInfo);
    message.react('✅');

    tools.sendToLogs(client, `Added welcome message \`${newWelcome}\` to ${message.guild.name}`);
    console.log(`Added welcome message \`${newWelcome}\` to ${message.guild.name}`);
};
