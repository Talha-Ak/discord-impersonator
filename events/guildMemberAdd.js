const { GuildMember, DiscordAPIError } = require('discord.js');
const tools = require('../tools');

/**
 * This is the main function of Impersonator.
 * Get the member's information and send out a message through the guild's webhook using that info.
 * @param {GuildMember} member
 */
const execute = async (member) => {
    const client = member.client;

    // Check if the bot has the permissions needed to work.
    const requiredPerms = ['MANAGE_WEBHOOKS'];
    if (!member.guild.me.permissions.has(requiredPerms)) {
        return;
    }

    let guildInfo = '';

    try {
        // Check if the guild has set up any welcome messages to use before creating webhook.
        guildInfo = await client.getGuildfromDb(member.guild);
        if (guildInfo.welcomeMsgs.length < 1) return;

        if (!guildInfo.webhookID) {
            await tools.repairMissingWebhook(member.guild, guildInfo);
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
        if (err instanceof DiscordAPIError && err.code === 10015) {
            const foundWebhook = await tools.repairMissingWebhook(member.guild, guildInfo);
            if (foundWebhook) {
                return client.emit('guildMemberAdd', member);
            } else {
                console.error(err);
            }
        } else {
            console.error(err);
        }
    }
};

/**
 * Event when a new member joins a guild.
 */
module.exports = {
    name: 'guildMemberAdd',
    execute,
};
