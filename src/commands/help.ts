import { ActionRowBuilder, ButtonBuilder, ButtonStyle, channelMention, hyperlink, inlineCode, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { client } from '..';
import { Command } from '../structures/Command';
import { ErrorEmbedBuilder, NeutralEmbedBuilder } from '../structures/Embed';

export default new Command({
    info: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help information for impersonator')
        .setDMPermission(false),

    run: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true });

        const guildInfo = await client.database.getGuildInfo(interaction.guild);
        let channelId = guildInfo?.channelID;
        if (!channelId) {
            // Check if we can edit webhooks.
            if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageWebhooks)) {
                interaction.editReply({
                    embeds: [new ErrorEmbedBuilder()
                        .setTitle('Missing permissions!')
                        .setDescription(`impersonator needs the ${inlineCode('Manage Webhooks')} permission to function properly.`),
                    ],
                });
                return;
            }

            channelId = (await client.fetchDbWebhook(interaction.guild, guildInfo)).channelId;
        }

        interaction.editReply({
            embeds: [new NeutralEmbedBuilder()
                .setTitle('impersonator help')
                .setDescription(
                    `Welcome messages are sent to ${channelMention(channelId)}
                    This can be changed with /setchannel
                    Need help? ${hyperlink('View video tutorial (YouTube)', 'https://youtu.be/VMD_GDEzA38')}`
                )
                .addFields(
                    { name: 'Add message', value: `/add ${inlineCode('message')}`, inline: true },
                    { name: 'List messages', value: `/list | /list ${inlineCode('number')}`, inline: true },
                    { name: 'Remove message', value: `/remove ${inlineCode('number')}`, inline: true },
                    { name: 'Set welcome channel', value: `/setchannel ${inlineCode('#channel')}`, inline: true },
                    { name: 'Say as user', value: `/say ${inlineCode('@user')} ${inlineCode('message')} ${inlineCode('<#channel>')}`, inline: true },
                    { name: 'Make custom message', value: `/make ${inlineCode('name')} ${inlineCode('avatar link')} ${inlineCode('message')} ${inlineCode('<#channel>')}`, inline: true }
                ),
            ],
            components: [new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Invite bot')
                        .setURL(client.config.botInviteUrl),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Support server')
                        .setURL(client.config.supportServerUrl)
                ),
            ],
        });
    },
});
