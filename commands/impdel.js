const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const tools = require('../tools');

const execute = async (interaction, dbGuildInfo) => {
    // Defer reply so we have enough time to fetch data from db.
    await interaction.deferReply();
    const msgIdx = interaction.options.getInteger('position');

    // Reject delete if id outside message array.
    if (dbGuildInfo.welcomeMsgs?.length < msgIdx) {
        await interaction.editReply({ embeds: [getNotExistEmbed(msgIdx, true)] });
        return;
    }

    const deletedMsg = dbGuildInfo.welcomeMsgs.splice(msgIdx - 1, 1);

    // Push new message list to database.
    try {
        await interaction.client.updateGuildInDb(interaction.guild, dbGuildInfo);
        await interaction.editReply({ embeds: [getMessageDeletedEmbed(msgIdx, deletedMsg[0], true)] });
    } catch (error) {
        console.log(error);
    }
};

const getNotExistEmbed = (number, slash) => new MessageEmbed()
    .setTitle('Invalid position!')
    .setColor(tools.embedWarnColour)
    .setDescription(`A welcome message with number \`#${number}\` does not exist.`)
    .setFooter(`${slash ? '/list' : '.implist'} to see all exisitng messages`);

const getMessageDeletedEmbed = (number, message, slash) => new MessageEmbed()
    .setTitle('Message deleted')
    .setColor(tools.embedNeutralColour)
    .setDescription(`Welcome message \`#${number}\` was deleted:\n\`${message}\``)
    .setFooter(`${slash ? '/list' : '.implist'} to see all exisitng messages`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a welcome message')
        .addIntegerOption(opt =>
            opt.setName('position')
                .setDescription('The position of the welcome message to delete (see /list)')
                .setRequired(true)),
    execute,
};
