const { Role, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const execute = async (interaction, dbGuildInfo) => {
    // Defer reply so we have enough time to respond.
    await interaction.deferReply();

    // Check if people other than admin are using this command.
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
        await interaction.editReply({
            content: '❗ Only people with the Manage Servers permission (or an admin) can use this command.',
            ephemeral: true,
        });
        return;
    }

    try {
        if (interaction.options.getSubcommand() === 'none') {
            dbGuildInfo.roleID = '';
            await interaction.client.updateGuildInDb(interaction.guild, dbGuildInfo);
            await interaction.editReply('Updated - Only server managers can use impersonator');
        } else if (interaction.options.getSubcommand() === 'role') {
            const role = interaction.options.getRole('role');
            dbGuildInfo.roleID = role.id;
            await interaction.client.updateGuildInDb(interaction.guild, dbGuildInfo);
            await interaction.editReply(`Updated - Only server managers and \`${role.name}\` can use impersonator`);
        }
    } catch (error) {
        console.log(error);
    }

};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allow')
        .setDescription('Configure role to use impersonator')
        .addSubcommand(subcmd =>
            subcmd.setName('none')
                .setDescription('Remove the role allowed'))
        .addSubcommand(subcmd =>
            subcmd.setName('role')
                .setDescription('Set allowed role to use impersonator')
                .addRoleOption((opt =>
                    opt.setName('role')
                        .setDescription('Select the role that can use impersonator')
                        .setRequired(true)))),
    execute,
};
