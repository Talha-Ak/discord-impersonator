const { Client, Message, DiscordAPIError, Collection } = require('discord.js');
const tools = require('../tools');

/**
 * Parse the message given to the bot and run the corresponding command.
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {

    if (message.author.bot) return;

    // TODO: Custom prefixes (requires local caching)
    // const guildInfo = await client.getGuildfromDb(message.guild);
    // if (!message.content.startsWith(guildInfo.prefix)) return;
    const prefix = client.config.defaultSettings.prefix;
    if (!message.content.startsWith(prefix)) return;

    // Try to find a matching command.
    const args = message.content.trim().slice(prefix.length).split(/ +/g);
    const typedCommand = args.shift().toLowerCase();
    const command = client.commands.get(typedCommand);
    if (!command) return;

    // If the user is allowed to use commands, run the command.
    const guildInfo = await client.getGuildfromDb(message.guild);
    const validUser = message.member.hasPermission('MANAGE_GUILD') || guildInfo.roleID == '-1' || message.member.roles.cache.find(r => r.id == guildInfo.roleID);
    if (validUser) {

        if (!client.cooldowns.has(command)) {
            client.cooldowns.set(command, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.guild.id)) {
            const expiryTime = timestamps.get(message.guild.id) + cooldownAmount;

            if (now < expiryTime) {
                const timeLeft = (expiryTime - now) / 1000;
                return message.channel.send(`You need to wait ${timeLeft.toFixed(0)} more second(s) before running \`${typedCommand}\` again.`);
            }
        }
        timestamps.set(message.guild.id, now);
        setTimeout(() => timestamps.delete(message.guild.id), cooldownAmount);

        tools.sendToLogs(client, `Command run in ${message.guild.name} | ${message.guild.id}: \`${message.content}\``);
        command.run(client, message, args, guildInfo);
    }
};
