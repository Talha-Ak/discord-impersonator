const { MessageEmbed, Client, Message } = require('discord.js');

/**
 * Lists all welcome messages the server has.
 * Command format: implist [number]
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    // If an additional arg specified, try to find corresponding index of welcome message.
    if (args[0]) {

        if (guildInfo.welcomeMsgs && guildInfo.welcomeMsgs.length >= args[0]) {
            message.channel.send(`Welcome message #${args[0]}: ${guildInfo.welcomeMsgs[args[0] - 1]}`);
        } else {
            message.channel.send('That welcome message does not exist.');
        }

    } else if (guildInfo.welcomeMsgs) {
        // If no arg specific, list all welcome messages the server has set.
        let description = '__These are your welcome messages:__\n';

        // Truncate any long welcome messages while listing them all.
        guildInfo.welcomeMsgs.forEach((welcome, i) => {
            if (welcome.length <= 82) {
                description += `${i + 1}: ${welcome}\n`;
            } else {
                description += `${i + 1}: ${welcome.substring(0, 79)}...\n`;
            }
        });

        description += `\nMessages can be deleted with ${guildInfo.prefix}impdel \`number\``;
        description += `\n${guildInfo.welcomeMsgs.length}/20 messages`;

        // Create and send the actual message.
        const embed = new MessageEmbed()
            .setTitle('Welcome messages')
            .setColor('#444444')
            .setDescription(description)
            .setTimestamp()
            .setFooter(`${guildInfo.prefix}implist <number> shows entire message`);

        message.channel.send(embed);
    } else {
        message.channel.send(`No welcome messages have been setup for this server. Add messages with ${guildInfo.prefix}impadd`);
    }

};
