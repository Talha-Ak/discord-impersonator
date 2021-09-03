const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const execute = async (interaction) => {
    interaction.reply({ embeds: [getEmbed(interaction.client, interaction.user)] });
};

const getEmbed = (client, user) => {
    // Only allow bot owners to use command.
    if (!client.config.owners.includes(user.id)) return;

    const serverCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const embed = new MessageEmbed()
        .setAuthor('Statistics')
        .setTitle(`Impersonator is currently in ${serverCount} servers`)
        .setDescription(`Currently serving ${userCount} users (inc bots)`);

    return embed;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show impersonator statistics'),
    private: true,
    execute,
};
