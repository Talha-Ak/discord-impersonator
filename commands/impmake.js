const { WebhookClient, Client, Message, DiscordAPIError } = require('discord.js');
const { FetchError } = require('node-fetch');
const tools = require('../tools');

/**
 * Lets a user send a message as a custom "user" with a customaisable name and avatar.
 * Command format: impmake <name> <avatarUrl> [channel] <message>
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    // Check if the bot has the permissions needed to work.
    const requiredPerms = ['MANAGE_WEBHOOKS', 'MANAGE_MESSAGES'];
    if (!message.guild.me.hasPermission(requiredPerms)) {
        return await tools.getAvailableTextChannel(message.guild, message.channel).send('Impersonator requires Manage Webhooks permission, and this command requires Manage Messages permission to delete your command once acknowledged.');
    }

    // Get mentioned channel and message. If not channel mentioned, get current channel.
    let sendingChannel = message.mentions.channels.first();
    let msg = args.slice(3).join(' ');
    if (!sendingChannel) {
        sendingChannel = message.channel;
        msg = args.slice(2).join(' ');
    }

    // If missing an arg or no message content, show usage info.
    if (!args[2] || msg.length < 1) {
        return message.channel.send(
            `Usage: ${guildInfo.prefix}impmake \`name\` \`link for avatar\` \`#CHANNEL\` \`message\` --- name must have no spaces, #CHANNEL is optional and defaults to current channel`);
    }

    try {
        if (!guildInfo.webhookID) {
            await tools.repairMissingWebhook(client, message.guild, guildInfo);
        }

        const webhook = await client.fetchWebhook(guildInfo.webhookID);
        const webhookChannel = webhook.channelID;

        const givenName = args[0].replace(/clyde/gi, 'clyed');
        let givenUrl = args[1];
        if (!(givenUrl.startsWith('https://') || givenUrl.startsWith('http://'))) {
            givenUrl = `https://${args[1]}`;
        }

        // Edit the webhook's properties to be the given name and avatar.
        // Webhooks are not allowed to be named 'clyde' and must be renamed if so.
        // https://discord.com/developers/docs/resources/webhook#create-webhook
        await webhook.edit({
            name: givenName,
            avatar: givenUrl,
            channel: sendingChannel,
        }, `Executing impmake command, used by ${message.author.username}`);

        // Send the custom message and delete the command message.
        await webhook.send(msg);
        await message.delete();

        // Revert the webhook back to it's default details.
        webhook.edit({
            name: client.config.webhookName,
            avatar: client.config.webhookAvatar,
            channel: webhookChannel,
        }, 'Change webhook to default details');

    } catch (err) {
        if (err instanceof DiscordAPIError) {
            if (err.httpStatus == 404) {
                tools.sendToLogs(client, `Trying to repair webhook 404 at ${message.guild.name} | ${message.guild.id}`);
                const foundWebhook = await tools.repairMissingWebhook(client, message.guild, guildInfo);
                if (foundWebhook) return client.commands.get('impmake').run(client, message, args, guildInfo);
            }
        } else if (err instanceof FetchError) {
            message.channel.send('Invalid link. Link must be an image file.');
            return;
        }
        tools.sendToLogs(client, `🔥 Problem happened with impmake in: ${message.guild.name} | ${message.guild.id}`);
        tools.sendToLogs(client, err.stack);
        console.error(err);
        message.channel.send('Something went wrong... \nPossible causes: Invalid link / Spaces in name');
        return;
    }
};
