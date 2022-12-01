import { ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, InteractionReplyOptions, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command } from '../structures/Command';
import { ErrorEmbedBuilder, NeutralEmbedBuilder } from '../structures/Embed';
import { ButtonInfoType, MessageCommandButtonInfo } from '../interfaces/Button';
import { getMessagesListReply } from '../utils/replies';

export default new Command({
    info: new SlashCommandBuilder()
        .setName('list')
        .setDescription('View all welcome messages')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(opt =>
            opt.setName('position')
                .setDescription('The position of the message to view in full')
                .setMinValue(1)),

    run: async ({ client, interaction }) => {
        await interaction.deferReply({ ephemeral: true });
        const msgIdx = interaction.options.getInteger('position');

        // Get guild info, if not found generate new one.
        let guildInfo = await client.database.getGuildInfo(interaction.guild);
        if (!guildInfo) {
            if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageWebhooks)) {
                interaction.editReply({
                    embeds: [new ErrorEmbedBuilder()
                        .setTitle('Missing permissions!')
                        .setDescription(`impersonator needs the ${inlineCode('Manage Webhooks')} permission to run this command.`),
                    ],
                });
                return;
            }

            ({ guildInfo } = await client.repairInfo(interaction.guild));
        }

        // If message index specified, show corresponding message. Otherwise, fall through.
        if (msgIdx) {
            const messageText = guildInfo.welcomeMsgs[msgIdx - 1];
            if (messageText) {
                interaction.editReply(getMessageReply(messageText, msgIdx));
                return;
            }
        }

        // List all messages or show no messages embed.
        if (guildInfo.welcomeMsgs.length > 0) {
            interaction.editReply(getMessagesListReply(guildInfo.welcomeMsgs, interaction.guild.name));
        } else {
            interaction.editReply({ embeds: [getNoMessagesEmbed()] });
        }

    },
});

const getMessageReply = (message: string, idx: number): InteractionReplyOptions => {
    const buttonInfo: MessageCommandButtonInfo = { type: ButtonInfoType.MessageRemove, data: message };
    return {
        embeds: [new NeutralEmbedBuilder()
            .setTitle(`Message ${idx}`)
            .setDescription(message),
        ],
        components: [new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(JSON.stringify(buttonInfo))
                    .setLabel('Remove')
                    .setStyle(ButtonStyle.Danger)
            ),
        ],
    };
};

const getNoMessagesEmbed = () =>
    new NeutralEmbedBuilder()
        .setTitle('No welcome messages')
        .setDescription(
            `No welcome messages have been set up for this server.
            Add messages with /add`
        );
