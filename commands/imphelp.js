const { MessageEmbed, Client, Message } = require('discord.js');

/**
 * Sends a help message to the guild.
 * Command format: imphelp
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args, guildInfo) => {

    const embed = new MessageEmbed()
        .setAuthor('Help menu')
        .setTitle('View video tutorial')
        .setURL('https://youtu.be/VMD_GDEzA38')
        .setColor('#444444')
        .setDescription(`Prefix any commands given with \`${guildInfo.prefix}\`\nChange welcome channel: Server Settings > Integrations > impersonator\nNeed help? [Visit our support server](https://discord.gg/MHHd7tD) or [invite it to your server](https://bit.ly/3lFysPr)\n`)
        .addField('Add message', 'impadd `message`', true)
        .addField('List messages', 'implist | implist `number`', true)
        .addField('Delete message', 'impdel `number`', true)
        .addField('Message as user', 'impsay `@user/ID` `#CHANNEL` `message`', true)
        // .addField('Change prefix', 'impprefix `prefix`', true)
        .addField('Allow a role to use bot', 'impallow `@role/ID` or `NONE/ALL`', true)
        .addField('Make & send a custom message', 'impmake `name` `avatar link` `#CHANNEL` `message`', true)
        .setTimestamp()
        .setFooter('Impersonator', client.user.displayAvatarURL());

    message.channel.send(embed);
};
