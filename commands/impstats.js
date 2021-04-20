const { Client, Message, MessageEmbed } = require('discord.js');

/**
 * Generates statistics
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args) => {

        // Only allow bot owners to use command.
        if (!client.config.owners.includes(message.author.id)) return;

        const serverCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        let memberCount = 0;

        if (args.length != 0) {
            client.guilds.cache.forEach(guild => {
                const noBots = guild.members.cache.filter(m => !m.user.bot);
                memberCount += noBots.size;
            });
        }

        let descString = `Currently serving ${userCount} users (inc bots)`;
        if (args.length != 0) {
            descString += `\nUsed by ${memberCount} members`;
        }

        const embed = new MessageEmbed()
        .setAuthor('Statistics')
        .setTitle(`Impersonator is currently in ${serverCount} servers`)
        .setDescription(descString);

        message.channel.send(embed);
};
