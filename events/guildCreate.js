const { MessageEmbed, Client, Guild, DiscordAPIError } = require('discord.js');
const tools = require('../tools');

/**
 * This runs when the bot is added to a new guild.
 * It creates a database entry for the guild and sets up the webhook.
 * @param {Client} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {

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
            if (err.httpStatus == 403) {
                tools.sendToJoins(client, `No webhook perms joining ${guild.name} | ${guild.id}`);
                console.log(`${guild.name} | ${guild.id} altered permissions`);
                await allowedChannel.send('Looks like you denied the Manage Webhooks permission. That\'s needed to edit the name and avatar of the webhook created, which is the main function of this bot.');
                await allowedChannel.send('The bot will function in a limited state, and *will not impersonate people* until the Manage Webhooks permission is granted. Use `.imphelp` to see what you can do.');
                await client.createGuildInDb({ guildID: guild.id });
            }
            console.log('~~~~~~~~~~ HANDLED ERROR ~~~~~~~~~~');
            console.log(err);
        }
    }

    console.log(`Guild ${guild.name} | ${guild.id} added.`);
    tools.sendToJoins(client, `Joined ${guild.name} | ${guild.id}`);

    // Send a welcome message to the server, confirming the bot has been setup.
    const embed = new MessageEmbed()
        .setAuthor('Thanks for adding Impersonator')
        .setTitle(`Messages will be sent to #${allowedChannel.name}`)
        .setColor('#444444')
        .setDescription(`Channel can be changed in Server Settings > Integrations > impersonator\nAnytime a new person joins the server, a random message is sent in their name\nStart adding messages with ${client.config.defaultSettings.prefix}impadd`)
        .addField('Developers', 'Riptide#4702 + legendarygamer69xxx#8580', true)
        .addField('Video tutorial', '[Here](https://youtu.be/VMD_GDEzA38)', true)
        .addField('Support server', '[Here](https://discord.gg/MHHd7tD)', true)
        .addField('Get started!', `Use \`${client.config.defaultSettings.prefix}imphelp\` to see what you can do.`)
        .setTimestamp()
        .setFooter(`${client.config.defaultSettings.prefix}imphelp to view commands`);
    allowedChannel.send(embed);
};
