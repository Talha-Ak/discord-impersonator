const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const tools = require('../tools');

const execute = async (interaction, dbGuildInfo) => {
    // Defer reply so we have enough time to respond.
    await interaction.deferReply();
    const message = interaction.options.getString('message');

    // Reject add if it will exceed their 20 message limit.
    if (dbGuildInfo.welcomeMsgs.length >= 20) {
        return await interaction.editReply({ embeds: [getLimitReachedEmbed(true)] });
    }

    dbGuildInfo.welcomeMsgs.push(message);

    // Push new message list to database.
    try {
        await interaction.client.updateGuildInDb(interaction.guild, dbGuildInfo);
        await interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle('Message added')
                .setColor(tools.embedNeutralColour)
                .setDescription(`\`${message}\``).setFooter(`/list to see all existing messages — ${dbGuildInfo.welcomeMsgs.length} / 20`)],
        });
    } catch (error) {
        console.log(error);
    }
};

const getLimitReachedEmbed = slash => new MessageEmbed()
    .setTitle('Message limit reached!')
    .setColor(tools.embedWarnColour)
    .setDescription('You cannot add any more messages (20 message limit)\nExisting messages must be deleted first before adding new ones.')
    .setFooter(`${slash ? '/list' : '.implist'} to see all exisitng messages`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add a welcome message')
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('The message to use')
                .setRequired(true)),
    execute,
};
