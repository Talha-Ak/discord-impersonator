const { SlashCommandBuilder } = require('@discordjs/builders');

const execute = async (interaction) => {
    // Only allow bot owners to use command.
    if (!interaction.client.config.owners.includes(interaction.user.id)) {
        await interaction.reply({ content: '❗ You cannot run that command.', ephemeral: true });
        return;
    }

    // Defer so enough time is given to run command.
    await interaction.deferReply();
    const code = interaction.options.getString('expression');

    try {
        const evaled = eval(code);
        const clean = await cleanOutput(interaction.client, evaled);

        // If output exceeds Discord message limit, export output to file.
        const MAX_CHARS = 3 + 2 + clean.length + 3;
        if (MAX_CHARS > 2000) {
            return interaction.editReply({
                content: 'Output exceeded 2000 chars. Output exported to file.',
                files: [{
                    attachment: Buffer.from(clean),
                    name: 'output.txt',
                }],
            });
        }

        return interaction.editReply(`\`\`\`js\n${clean}\n\`\`\``);

    } catch (error) {
        interaction.editReply(`\`\`\`bash\n${await cleanOutput(interaction.client, error)}\n\`\`\``);
    }
};

// Cleans the output from any private content.
async function cleanOutput(client, text) {
    if (text && text.constructor.name === 'Promise') text = await text;
    if (typeof text !== 'string') text = require('util').inspect(text);

    // Prevent mentions from happening, hide any token leak.
    text = text
        .replace(client.token, 'REDACTED')
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203));

    return text;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate a JavaScript expression')
        .addStringOption(opt =>
            opt.setName('expression')
                .setDescription('The expression to evaluate')
                .setRequired(true)),
    private: true,
    execute,
};
