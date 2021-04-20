const { WebhookClient, Client, Message, DiscordAPIError } = require('discord.js');
const tools = require('../tools');

/**
 * Lets a user send messages as another user.
 * Command format: impsay <@user/userId> [channel] <message>
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    const requiredPerms = ['MANAGE_WEBHOOKS', 'MANAGE_MESSAGES'];
    if (!message.guild.me.hasPermission(requiredPerms)) {
        return await tools.getAvailableTextChannel(message.guild, message.channel).send('Impersonator requires Manage Webhooks, and this command requires Manage Messages to delete your command once acknowledged.');
    }

    // Check if user mentioned, if not then get user ID provided.
    let taggedMember = message.mentions.members.first();
    if (!taggedMember) {
        try {
            taggedMember = await message.guild.members.fetch(args[0]);
        } catch {
            taggedMember = null;
        }
    }

    // Get channel and message. If no channel specified, get current channel.
    let sendingChannel = message.mentions.channels.first();
    let msg = args.slice(2).join(' ');
    if (!sendingChannel) {
        sendingChannel = message.channel;
        msg = args.slice(1).join(' ');
    }

    // If no user specified or no message provided, show usage info.
    if (!taggedMember || msg.length < 1) {
        return message.channel.send(
            `Usage: ${guildInfo.prefix}impsay \`@user/ID #CHANNEL message\` --- #CHANNEL is optional, defaults to current channel`);
    }

    try {
        if (!guildInfo.webhookID) {
            await tools.repairMissingWebhook(client, message.guild, guildInfo);
        }

        const webhook = await client.fetchWebhook(guildInfo.webhookID);
        const webhookChannel = webhook.channelID;

        // Edit the webhook's properties to be the given name and avatar.
        // Webhooks are not allowed to be named 'clyde' and must be renamed if so.
        // https://discord.com/developers/docs/resources/webhook#create-webhook
        await webhook.edit({
            name: taggedMember.displayName.replace(/clyde/gi, 'clyed'),
            avatar: taggedMember.user.displayAvatarURL(),
            channel: sendingChannel,
        }, `Executing impsay command, used by ${message.author.username}`);

        // Send the custom message and delete the command message.
        await webhook.send(msg);
        await message.delete();

        // Revert the webhook back to it's default details.
        // Commented out to reduce amount of API calls.
        // Should enable it for small deployments.
        // await webhook.edit({
        //     name: client.config.webhookName,
        //     avatar: client.config.webhookAvatar,
        //     channel: webhookChannel,
        // }, 'Change webhook to default details');
        // console.log('impsay: reverted webhook');

        tools.sendToLogs(client, `.impsay success at ${message.guild.name} | ${message.guild.id}`);

    } catch (err) {
        if (err instanceof DiscordAPIError) {
            if (err.httpStatus == 404) {
                tools.sendToLogs(client, `Trying to repair webhook 404 at ${message.guild.name} | ${message.guild.id}`);
                try {
                    const foundWebhook = await tools.repairMissingWebhook(client, message.guild, guildInfo);
                    if (foundWebhook) {
                        return client.commands.get('impsay').run(client, message, args, guildInfo);
                    } else {
                        tools.sendToLogs(client, `Can't repair webhooks for some reason at ${message.guild.name} | ${message.guild.id}`);
                        console.error(err);
                    }
                } catch (err) {
                    if (err instanceof DiscordAPIError) {
                        if (err.httpStatus == 403) {
                            return await tools.getAvailableTextChannel(message.guild, message.channel).send('Impersonator requires Manage Webhooks, and this command requires Manage Messages to delete your command once acknowledged.');
                        }
                    }
                }
            } else if (err.httpStatus == 403) {
                return await tools.getAvailableTextChannel(message.guild, message.channel).send('Impersonator requires Manage Webhooks, and this command requires Manage Messages to delete your command once acknowledged.');
            }
        }
        tools.sendToLogs(client, `🔥 Problem happened with impsay in: ${message.guild.name} | ${message.guild.id}`);
        tools.sendToLogs(client, `${err.stack}`);
        console.error(err);
        message.channel.send('Something went wrong while trying to run that.');
    }
};

exports.cooldown = 5;
