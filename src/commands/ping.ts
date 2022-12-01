import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../structures/Command';

export default new Command ({
    info: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('replies with pong')
        .setDMPermission(false),
    private: true,

    run: async ({ interaction }) => {
        interaction.reply('Pong');
    },
});
