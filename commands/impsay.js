const { Permissions, DiscordAPIError, Constants, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const tools = require('../tools');

/**
 *
 * @param {import('discord.js').CommandInteraction} interaction
 */
const execute = async (interaction, dbGuildInfo) => {
    // Defer reply so there is enough time to fetch data from network.
    await interaction.deferReply({ ephemeral: true });

    // Check if the bot has required perms before executing.
    const requiredPerms = [Permissions.FLAGS.MANAGE_WEBHOOKS];
    if (!interaction.guild.me.permissions.has(requiredPerms)) {
        return await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle('Missing permissions!')
                .setColor(tools.embedWarnColour)
                .setDescription('Impersonator needs the `Manage Webhooks` permission to run this command.')],
            ephemeral: true,
        });
    }

    // Check if a valid channel was given.
    const sendingChannel = interaction.options.getChannel('channel') ?? interaction.channel;
    if (!sendingChannel.isText()) {
        return await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle('Invalid channel!')
                .setColor(tools.embedWarnColour)
                .setDescription('The channel given must be text-based channel.')],
            ephemeral: true,
        });
    }

    // Gather command arguments.
    const taggedMember = interaction.options.getMember('user');
    const sendingMessage = interaction.options.getString('message');

    // Webhooks are not allowed to be named 'clyde' and must be renamed if so.
    // https://discord.com/developers/docs/resources/webhook#create-webhook
    const properties = {
        name: taggedMember.displayName.replace(/clyde/gi, 'clyed'),
        avatar: taggedMember.user.displayAvatarURL(),
        channel: sendingChannel,
    };

    // Fetch the webhook.
    let webhook;
    try {
        webhook = await interaction.client.fetchWebhook(dbGuildInfo.webhookID);
    } catch (error) {
        if (error instanceof DiscordAPIError && (error.code === 0 || error.code === Constants.APIErrors.UNKNOWN_WEBHOOK)) {
            webhook = await tools.repairMissingWebhook(interaction.guild, dbGuildInfo);
        }
    }

    // Check if the existing webhook already matches the user arguments.
    // If so, skip editing the webhook and send.
    const identicalWebhook = webhook.name === properties.name
        && webhook.avatar === properties.avatar
        && webhook.channelId === properties.channel.id;

    if (!identicalWebhook) {
        try {
            await webhook.edit(properties, `Executing "say" command from ${interaction.user.tag}`);
        } catch (error) {
            if (error instanceof DiscordAPIError && error.code === Constants.APIErrors.UNKNOWN_WEBHOOK) {
                webhook = await tools.repairMissingWebhook(interaction.guild, dbGuildInfo);
                try {
                    await webhook.edit(properties, `Executing "say" command from ${interaction.user.tag}`);
                } catch (editError) {
                    console.error(editError);

                    return await interaction.editReply({
                        embeds: [new MessageEmbed()
                            .setColor(tools.embedWarnColour)
                            .setDescription('Something went wrong trying to run that...')],
                    });
                }
            }
        }
    }

    // Send the custom message.
    await webhook.send(sendingMessage);
    await interaction.editReply({
        embeds: [new MessageEmbed()
            .setColor(tools.embedNeutralColour)
            .setDescription(`Message sent to ${sendingChannel}`)],
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say a message as another user')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('The user to send a message as')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('The channel the message is sent to (default: current channel)')),
    execute,
};
