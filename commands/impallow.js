const { Role, Client, Message } = require('discord.js');

/**
 * Configures the role which is allowed to use Impersonator commands in that guild.
 * Command format: impallow <@role/roleId/"NONE">
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    // Check if admin using this command.
    if (!message.member.hasPermission('MANAGE_GUILD')) return message.reply('you can\'t use that command.');

    // Check if the admin wants the clear the allowed role.
    if (args[0] && args[0].toLowerCase() == 'none') {
        guildInfo.roleID = '';
    } else if (args[0] && (args[0].toLowerCase() == 'all' || args[0].toLowerCase() == '@everyone')) {
        guildInfo.roleID = '-1';
    } else {

        // Find the role mentioned in the command, or the role ID.
        let taggedRole = message.mentions.roles.first();
        if (!taggedRole) {
            taggedRole = await message.guild.roles.fetch(args[0]);

            // If no role is mentioned, show usage help.
            if (typeof taggedRole !== Role) {
                let usageText = '';

                if (guildInfo.roleID == '-1') {
                    usageText = 'Currently everybody can use Impersonator';
                } else if (guildInfo.roleID) {
                    const currentRole = await message.guild.roles.fetch(guildInfo.roleID);
                    usageText = `Currently server managers and people with the \`${currentRole.name}\` role can use Impersonator`;
                } else {
                    usageText = 'Currently only server managers can use impersonator';
                }

                return message.channel.send(`Usage: ${guildInfo.prefix}impallow \`@role/ID\` or \`NONE\` or \`ALL\` | ${usageText}`);
            }
        }

        guildInfo.roleID = taggedRole.id;
    }

    await client.updateGuildInDb(message.guild, guildInfo);
    message.react('✅');
};
