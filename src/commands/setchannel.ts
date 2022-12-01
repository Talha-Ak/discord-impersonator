import {
  channelMention,
  ChannelType,
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { Command } from '../structures/Command';
import { ConfirmEmbedBuilder, ErrorEmbedBuilder } from '../structures/Embed';

export default new Command({
  info: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Change welcome message channel')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('The channel to send messages to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),

  run: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.getChannel(
      'channel',
      true
    ) as TextChannel;

    let guildInfo = await client.database.getGuildInfo(interaction.guild);
    if (!guildInfo) {
      // Check if we can edit webhooks.
      if (
        !interaction.appPermissions?.has(PermissionFlagsBits.ManageWebhooks)
      ) {
        interaction.editReply({
          embeds: [
            new ErrorEmbedBuilder()
              .setTitle('Missing permissions!')
              .setDescription(
                `impersonator needs the ${inlineCode(
                  'Manage Webhooks'
                )} permission to run this command.`
              ),
          ],
        });
        return;
      }

      ({ guildInfo } = await client.repairInfo(interaction.guild));
    }

    guildInfo.channelID = channel.id;

    await client.database.updateGuildInfo(guildInfo);
    interaction.editReply({ embeds: [getChannelChangedEmbed(channel)] });
  },
});

const getChannelChangedEmbed = (channel: TextChannel) =>
  new ConfirmEmbedBuilder()
    .setTitle('Welcome channel changed')
    .setDescription(
      `The welcome channel was changed to ${channelMention(channel.id)}`
    );
