const { WebhookClient, GuildMember, Client, DiscordAPIError, Webhook } = require('discord.js');
const tools = require('../tools');

/**
 * This runs every time a new member joins the guild, and is the main function of Impersonator.
 * It gets the member's information and sends out a message through the guild's webhook using that info.
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {

    // Check if the bot has the permissions needed to work.
    const requiredPerms = ['MANAGE_WEBHOOKS'];
    const textChannel = tools.getAvailableTextChannel(member.guild, member.guild.systemChannel);
    if (!member.guild.me.hasPermission(requiredPerms)) {
        if (textChannel) return await textChannel.send('Impersonator cannot work without Manage Webhooks permission.');
        else return;
    }

    let guildInfo = '';

    try {
        // Check if the guild has set up any welcome messages to use before creating webhook.
        guildInfo = await client.getGuildfromDb(member.guild);
        if (guildInfo.welcomeMsgs.length < 1) return;

        if (!guildInfo.webhookID) {
            await tools.repairMissingWebhook(client, member.guild, guildInfo);
        }

        const webhook = await client.fetchWebhook(guildInfo.webhookID);

        // Edit the webhook's properties to be the new member's name and avatar.
        // Webhooks are not allowed to be named 'clyde' and must be renamed if so.
        // https://discord.com/developers/docs/resources/webhook#create-webhook
        await webhook.edit({
            name: member.displayName.replace(/clyde/gi, 'clyed'),
            avatar: member.user.displayAvatarURL(),
        }, 'Change webhook to new member details');

        // Send a random welcome message.
        await webhook.send(guildInfo.welcomeMsgs[Math.floor(Math.random() * guildInfo.welcomeMsgs.length)]);

        // Revert the webhook back to it's default details.
        await webhook.edit({ name: client.config.webhookName, avatar: client.config.webhookAvatar }, 'Change webhook to default details');


    } catch (err) {
        if (err instanceof DiscordAPIError) {
            if (err.httpStatus == 404) {
                tools.sendToLogs(client, `Trying to repair webhook 404 at ${member.guild.name} | ${member.guild.id}`);
                try {
                    const foundWebhook = await tools.repairMissingWebhook(client, member.guild, guildInfo);
                    if (foundWebhook) {
                        return client.emit('guildMemberAdd', member);
                    } else {
                        tools.sendToLogs(client, `Can't repair webhooks for some reason at ${member.guild.name} | ${member.guild.id}`);
                        console.error(err);
                    }
                } catch (err) {
                    if (err instanceof DiscordAPIError) {
                        if (err.httpStatus == 403) {
                            return await tools.getAvailableTextChannel(member.guild, member.channel).send('Impersonator requires Manage Webhooks, and this command requires Manage Messages to delete your command once acknowledged.');
                        }
                    }
                }
            } else if (err.httpStatus == 403) {
                tools.sendToLogs(client, `guildMemberAdd but no webhook perms (403) in ${member.guild.name} | ${member.guild.id}`);
                if (textChannel) return await textChannel.send('Impersonator cannot work without Manage Webhooks permission.');
            }
        }
        tools.sendToLogs(client, `🔥 Problem happened with guildMemberAdd in: ${member.guild.name} | ${member.guild.id}`);
        tools.sendToLogs(client, err.stack);
        console.error(err);
    }
};
