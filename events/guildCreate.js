const { MessageEmbed, DiscordAPIError, Constants } = require('discord.js');
const tools = require('../tools');

/**
 * Creates a database entry for the guild and set up webhook.
 * @param {import('discord.js').Guild} guild
 */
const execute = async (guild) => {

    const client = guild.client;
    const embeds = [];

    // Find a channel where the bot can send messages (defaults to system channel).
    const allowedChannel = tools.getAvailableTextChannel(guild, guild.systemChannel);

    try {
        // Create webhook using an allowed channel and persist to db.
        const webhook = await allowedChannel.createWebhook(client.config.webhookName, {
            avatar: client.config.webhookAvatar,
            reason: 'Setup impersonator webhook',
        });

        await client.createGuildInDb({
            guildID: guild.id,
            webhookID: webhook.id,
        });

    } catch (err) {
        if (err instanceof DiscordAPIError) {
            if (err.code === Constants.APIErrors.MISSING_PERMISSIONS) {
                embeds.push(
                    new MessageEmbed()
                        .setTitle('Missing permissions!')
                        .setColor(tools.embedWarnColour)
                        .setDescription('Impersonator needs the `Manage Webhooks` permission to edit the name and avatar of the webhook created.\n\nImpersonation **will not work** until the permission is granted.\nThis can be done by allowing the `impersonator` role to `Manage Webhooks` on this server.')
                );
                await client.createGuildInDb({ guildID: guild.id });
            }
        }
    }

    console.log(`Guild ${guild.name} | ${guild.id} added.`);

    // Send a welcome message to the server, confirming the bot has been setup.
    embeds.push(
        new MessageEmbed()
            .setAuthor('Thanks for adding Impersonator')
            .setTitle(`Messages will be sent to #${allowedChannel.name}`)
            .setColor(tools.embedNoColour)
            .setDescription('Channel can be changed in Server Settings > Integrations > impersonator.\nAnytime a new person joins the server, a random message is sent in their name.\nStart adding messages with .impadd, or /add if you prefer.')
            .addField('Developers', 'Riptide#4702 + legendarygamer69xxx#8580', true)
            .addField('Video tutorial', '[Here](https://youtu.be/VMD_GDEzA38)', true)
            .addField('Support server', '[Here](https://discord.gg/MHHd7tD)', true)
            .addField('Get started!', 'Use `.imphelp` or `/help` to see what you can do.')
            .setTimestamp()
            .setFooter('.imphelp to view commands')
    );
    allowedChannel.send({ embeds });
};

/**
 * Event when the bot is added to a new guild.
 */
module.exports = {
    name: 'guildCreate',
    execute,
};
