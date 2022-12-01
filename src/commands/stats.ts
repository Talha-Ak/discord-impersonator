import { SlashCommandBuilder } from 'discord.js';

import { Command } from '../structures/Command';
import { ErrorEmbedBuilder, NeutralEmbedBuilder } from '../structures/Embed';

export default new Command ({
    info: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View impersonator statistics')
        .setDMPermission(false),
    private: true,

    run: async ({ client, interaction }) => {
        if (!client.config.owners.includes(interaction.user.id)) {
            interaction.reply({ embeds: [new ErrorEmbedBuilder().setDescription('You cannot run that command.')] });
        }

        const serverCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        interaction.reply({
            embeds: [new NeutralEmbedBuilder()
                .setAuthor({ name: 'Statistics' })
                .setTitle(`impersonator is currently in ${serverCount} servers`)
                .setDescription(`Currently serving ${userCount} users (inc bots)`),
            ],
        });
    },
});
