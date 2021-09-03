const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const tools = require('../tools');

const execute = async (interaction, dbGuildInfo) => {
    // Defer reply so we have enough time to respond.
    await interaction.deferReply();
    const msgIdx = interaction.options.getInteger('id');

    // If message id supplied, find the corresponding welcome message.
    if (msgIdx) {
        const messageText = { embeds: [getMessageEmbed(dbGuildInfo, msgIdx) ?? getMessageNotFoundEmbed(msgIdx, false)] };
        await interaction.editReply(messageText);

        // Otherwise, list all messages saved (or notify user there are no messages).
    } else if (dbGuildInfo.welcomeMsgs.length > 0) {
        await interaction.editReply({ embeds: [generateListEmbed(dbGuildInfo, true)] });
    } else {
        await interaction.editReply({ embeds: [getNoMessagesEmbed(true)] });
    }
};

const getMessageEmbed = (guildInfo, id) => {
    if (guildInfo.welcomeMsgs && guildInfo.welcomeMsgs.length >= id) {
        return new MessageEmbed().setTitle(`Message #${id}`)
            .setColor(tools.embedNoColour)
            .setDescription(`\`${guildInfo.welcomeMsgs[id - 1]}\``);
    }
};

const getNoMessagesEmbed = slash => new MessageEmbed()
    .setTitle('No welcome messages')
    .setColor(tools.embedNoColour)
    .setDescription(`No welcome messages have been setup for this server.\nAdd messages with ${slash ? '/add' : '.impadd'}`);

const getMessageNotFoundEmbed = (number, slash) => new MessageEmbed()
    .setTitle('Message not found!')
    .setColor(tools.embedWarnColour)
    .setDescription(`No welcome message at \`#${number}\` was found.`)
    .setFooter(`${slash ? '/list' : '.implist'} to see all existing messages`);

const generateListEmbed = (guildInfo, slash) => {
    // List all welcome messages the server has set.
    let description = '__These are your welcome messages:__\n';

    // Truncate any long welcome messages while listing them all.
    guildInfo.welcomeMsgs.forEach((welcome, i) => {
        if (welcome.length <= 82) {
            description += `${i + 1}: ${welcome}\n`;
        } else {
            description += `${i + 1}: ${welcome.substring(0, 79)}...\n`;
        }
    });

    description += `\nMessages can be deleted with ${slash ? '/delete' : '.impdelete'} \`number\``;
    description += `\n${guildInfo.welcomeMsgs.length}/20 messages`;

    // Create the actual message.
    return new MessageEmbed()
        .setTitle('Welcome messages')
        .setColor(tools.embedNoColour)
        .setDescription(description)
        .setTimestamp()
        .setFooter(`${slash ? '/list' : '.implist'} <number> shows entire message`);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('View all welcome messages')
        .addIntegerOption(opt =>
            opt.setName('position')
                .setDescription('The welcome message to view')),
    execute,
};
