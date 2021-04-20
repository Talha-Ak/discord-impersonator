const { TextChannel, Guild, Client } = require('discord.js');

module.exports = {

    /**
     * Tries to repair missing webhooks that can't be found, either by looking through existing webhooks or creating
     * a new webhook.
     * @param {Client} client
     * @param {Guild} guild
     */
    repairMissingWebhook: async function(client, guild, guildInfo) {

        // Get all existing webhooks and find the webhook which the bot created itself.
        const guildWebhooks = await guild.fetchWebhooks();
        let missingWebhook = guildWebhooks.find(hook => hook.owner ? hook.owner.id === client.user.id : false);

        try {
            // If found, "reset" the webhook.
            if (missingWebhook) {
                await missingWebhook.edit({ name: client.config.webhookName, avatar: client.config.webhookAvatar }, 'Change webhook to default details');
                this.sendToLogs(client, `Found the missing webhook in ${guild.name} | ${guild.id}`);
            } else {
                // If not found, make a new webhook.
                const availableChannel = this.getAvailableTextChannel(guild, guild.systemChannel);
                missingWebhook = await availableChannel.createWebhook(client.config.webhookName, {
                    avatar: client.config.webhookAvatar,
                    reason: 'Impersonator couldn\'t find the existing webhook when needed.',
                });
                this.sendToLogs(client, `Couldn't find webhook. Making new webhook in ${guild.name} | ${guild.id}`);
            }

            // Persist the id of the webhook to the db.
            guildInfo.webhookID = missingWebhook.id;
            await client.updateGuildInDb(guild, guildInfo);

        } catch (err) {
            this.sendToLogs(client, `🔥 Couldn't repair webhook! ${guild.name} | ${guild.id}`);
            this.sendToLogs(client, err.stack);
            console.error(err);
        }

        return missingWebhook;
    },

    /**
     * Check if the bot can use the given text channel, else find the next channel that the bot can use.
     * @param {Guild} guild
     * @param {TextChannel} preferredChannel
     * @returns {TextChannel}
     */
    getAvailableTextChannel: function(guild, preferredChannel) {
        const neededPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES'];
        if (preferredChannel == null || !preferredChannel.permissionsFor(guild.me).has(neededPerms)) {
            preferredChannel = guild.channels.cache.find(c => c.type === 'text' && c.permissionsFor(guild.me).has(neededPerms));
        }
        if (preferredChannel == null || !preferredChannel.permissionsFor(guild.me).has(neededPerms)) {
            preferredChannel = guild.channels.cache.first();
        }
        return preferredChannel;
    },

    /**
     * Send a message to a logging channel which records bot joins / leaves.
     * @param {Client} client
     * @param {string} message
     */
    sendToJoins: function(client, message) {
        client.channels.cache.get(client.config.logJoinsChannel).send(message);
    },

    /**
     * Send a message to a general logging channel.
     * @param {Client} client
     * @param {string} message
     */
    sendToLogs: function(client, message) {
        client.channels.cache.get(client.config.logChannel).send(message);
    },

};
