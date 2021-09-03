const { MessageEmbed } = require('discord.js');
const { embedNoColour } = require('../tools');
const { SlashCommandBuilder } = require('@discordjs/builders');

const execute = async (interaction) => {
    const embed = new MessageEmbed()
        .setAuthor('Help menu')
        .setColor(embedNoColour)
        .setDescription('Change welcome channel: Server Settings > Integrations > impersonator\n[Invite it to your server](https://discord.com/oauth2/authorize?client_id=749282568733458545&permissions=537160768&scope=bot%20applications.commands)\n')
        .addField('Add message', 'add `message`', true)
        .addField('List messages', 'list | list `number`', true)
        .addField('Delete message', 'delete `number`', true)
        .addField('Message as user', 'say `@user` `message` `<#channel>`', true)
        .addField('Allow a role to use bot', 'allow `@role`', true)
        .addField('Make & send a custom message', 'make `name` `avatar link` `message` `<#channel>`', true)
        .setTimestamp()
        .setFooter('Impersonator', interaction.client.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
};

/**
 * Sends a help message to the guild.
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help information about impersonator'),
    execute,
};
