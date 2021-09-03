const { Interaction, Collection, Permissions, MessageEmbed } = require('discord.js');
const tools = require('../tools');

/**
 * Delegate interaction to correct command.
 * @param {Interaction} interaction
 */
const execute = async (interaction) => {
    const client = interaction.client;

    // Ignore other types of interactions for now.
    if (!interaction.isCommand()) return;

    // If command doesn't exist (shouldn't happen...) return early.
    const cmdName = interaction.commandName;
    if (!client.commands.has(cmdName)) return;

    // Check user permissions
    const dbGuildInfo = await client.getGuildfromDb(interaction.guild);
    const validUser = dbGuildInfo.roleID === '-1' || interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) || interaction.member.roles.cache.get(dbGuildInfo.roleID);
    if (!validUser) {
        return await interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle('You can\'t do that!')
                .setColor(tools.embedWarnColour)
                .setDescription('You\'re not allowed to use impersonator.\nAsk a server manager to `/allow` your role if you should be able to use this.')],
            ephemeral: true,
        });
    }

    // If the user is allowed to use commands, run the command.
    try {
        if (!client.cooldowns.has(cmdName)) {
            client.cooldowns.set(cmdName, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(cmdName);
        const cooldownAmount = 2000;

        if (timestamps.has(interaction.guild.id)) {
            const expiryTime = timestamps.get(interaction.guild.id) + cooldownAmount;

            if (now < expiryTime) {
                const timeLeft = Math.ceil((expiryTime - now) / 1000);
                return await interaction.reply({
                    embeds: [new MessageEmbed().setColor(tools.embedWarnColour).setDescription(`You need to wait ${timeLeft} more second(s) before running \`/${cmdName}\` again.`)],
                    ephemeral: true,
                });
            }
        }
        timestamps.set(interaction.guild.id, now);
        setTimeout(() => timestamps.delete(interaction.guild.id), cooldownAmount);

        const content = interaction.options.data.map(opt => opt.value).join(' ').trim();
        await client.commands.get(interaction.commandName).execute(interaction, dbGuildInfo);
    } catch (error) {
        console.log(error);
        await interaction.editReply({
            embeds: [new MessageEmbed().setColor(tools.embedWarnColour).setDescription('Something went wrong trying to run that command...')],
            ephemeral: true,
        });
    }
};

/**
 * Event when the bot receives an interaction.
 */
module.exports = {
    name: 'interactionCreate',
    execute,
};
