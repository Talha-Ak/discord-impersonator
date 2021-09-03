const { DiscordAPIError, Permissions, MessageEmbed, Constants } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { FetchError } = require('node-fetch');
const tools = require('../tools');

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

    // Webhooks are not allowed to be named 'clyde' and must be renamed if so.
    // https://discord.com/developers/docs/resources/webhook#create-webhook
    const sendingName = interaction.options.getString('name').replace(/clyde/gi, 'clyed');
    let sendingImage = interaction.options.getString('image');
    if (!(sendingImage.startsWith('https://') || sendingImage.startsWith('http://'))) {
        sendingImage = `https://${sendingImage}`;
    }
    const sendingMessage = interaction.options.getString('message');

    const properties = {
        name: sendingName,
        avatar: sendingImage,
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
            } else if (error instanceof FetchError) {
                return await interaction.editReply({
                    embeds: [new MessageEmbed()
                        .setTitle('Invalid link!')
                        .setColor(tools.embedWarnColour)
                        .setDescription('The link given couldn\'t be used as an avatar.')],
                });
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
        .setName('make')
        .setDescription('Create a custom message')
        .addStringOption(opt =>
            opt.setName('name')
                .setDescription('The name the custom message is sent from')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('image')
                .setDescription('The URL of the image to show (.jpg/.png)')
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
