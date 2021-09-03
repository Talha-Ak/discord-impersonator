const { Permissions } = require('discord.js');

/**
 * Tries to repair missing webhooks that can't be found, either by looking through existing webhooks or creating
 * a new webhook.
 * @param {import('discord.js').Guild} guild
 */
const repairMissingWebhook = async (guild, dbGuildInfo) => {

    // Get all existing webhooks and find the webhook which the bot created itself.
    const guildWebhooks = await guild.fetchWebhooks();
    let foundWebhook = guildWebhooks.find(hook => hook.owner ? hook.owner.id === guild.me.id : false);

    // If not found, make a new webhook.
    if (!foundWebhook) {
        const availableChannel = getAvailableTextChannel(guild, guild.systemChannel);
        foundWebhook = await availableChannel.createWebhook(guild.client.config.webhookName, {
            avatar: guild.client.config.webhookAvatar,
            reason: 'Impersonator couldn\'t find the existing webhook when needed.',
        });
    }

    // Persist the id of the webhook to the db.
    dbGuildInfo.webhookID = foundWebhook.id;
    await guild.client.updateGuildInDb(guild, dbGuildInfo);

    return foundWebhook;
};

/**
 * Check if the bot can use the given text channel, else find the next channel that the bot can use.
 * This is legacy code, will be removed once messages are replaced with interactions.
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').TextChannel} preferredChannel
 * @returns {import('discord.js').TextChannel}
 */
const getAvailableTextChannel = (guild, preferredChannel) => {
    const neededPerms = [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES];

    // Find first channel with the required perms to send & receive messages.
    // (Loose equality to cover null and undefined)
    if (preferredChannel == null || !preferredChannel.permissionsFor(guild.me).has(neededPerms)) {
        preferredChannel = guild.channels.cache.find(c => c.type === 'GUILD_TEXT' && c.permissionsFor(guild.me).has(neededPerms));
    }

    // If not found, resort to the first channel available.
    if (preferredChannel == null || !preferredChannel.permissionsFor(guild.me).has(neededPerms)) {
        preferredChannel = guild.channels.cache.first();
    }
    return preferredChannel;
};


const embedWarnColour = '#ff0000';
const embedNeutralColour = '#0c4880';
const embedNoColour = '#2f3136';

module.exports = {
    repairMissingWebhook,
    getAvailableTextChannel,
    embedWarnColour,
    embedNeutralColour,
    embedNoColour,
};
