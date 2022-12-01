import { SlashCommandBuilder } from 'discord.js';
import { inspect } from 'util';

import { client } from '..';
import { Command } from '../structures/Command';
import { ErrorEmbedBuilder } from '../structures/Embed';

export default new Command ({
    info: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate a JS expression')
        .setDMPermission(false)
        .addStringOption(opt =>
            opt.setName('expression')
                .setDescription('The expression to evaluate')
                .setRequired(true)),
    private: true,

    run: async ({ interaction }) => {
        if (!client.config.owners.includes(interaction.user.id)) {
            interaction.reply({ embeds: [new ErrorEmbedBuilder().setDescription('You cannot run that command.')] });
        }

        await interaction.deferReply({ ephemeral: true });

        const code = interaction.options.getString('expression', true);

        try {
            const evaled = eval(code);
            const clean = await cleanOutput(evaled);

            // If output exceeds Discord message limit, export output to file.
            const MAX_CHARS = 3 + 2 + clean.length + 3;
            if (MAX_CHARS > 2000) {
                interaction.editReply({
                    content: 'Output exceeded 2000 chars. Output exported to file.',
                    files: [{
                        attachment: Buffer.from(clean),
                        name: 'output.txt',
                    }],
                });
                return;
            }

            interaction.editReply(`\`\`\`js\n${clean}\n\`\`\``);

        } catch (error) {
            interaction.editReply(`\`\`\`bash\n${await cleanOutput(error as Record<string, unknown>)}\n\`\`\``);
        }
    },
});

// Cleans the output from any private content.
async function cleanOutput(output?: Record<string, unknown>) {
    let text = '';
    if (output && output.constructor.name === 'Promise') output = await output;
    if (typeof output !== 'string') text = inspect(output);

    // Prevent mentions from happening, hide any token leak.
    text = text
        .replace(client.token ?? process.env.DISCORD_TOKEN, 'REDACTED')
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203));

    return text;
}
