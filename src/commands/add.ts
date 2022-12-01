import {
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
  WebhookEditMessageOptions,
} from 'discord.js';
import { Command } from '../structures/Command';
import { ConfirmEmbedBuilder, ErrorEmbedBuilder } from '../structures/Embed';
import { getListMessagesActionRow } from '../utils/replies';

export default new Command({
  info: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a welcome message')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt
        .setName('message')
        .setDescription('The message to use')
        .setRequired(true)
    ),

  run: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });
    const message = interaction.options.getString('message', true);

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

    if (guildInfo.welcomeMsgs.length >= 20) {
      await interaction.editReply(getLimitReachedReply());
      return;
    }

    const msgsUsed = guildInfo.welcomeMsgs.push(message);

    await client.database.updateGuildInfo(guildInfo);
    interaction.editReply(getMessageAddedReply(message, msgsUsed));
  },
});

const getLimitReachedReply = (): WebhookEditMessageOptions => ({
  embeds: [
    new ErrorEmbedBuilder()
      .setTitle('Welcome message limit reached')
      .setDescription(
        `You have reached the maximum number of welcome messages allowed.
            Remove existing messages before adding new ones.`
      )
      .setFooter({ text: '/list to see existing messages' }),
  ],
  components: [getListMessagesActionRow()],
});

const getMessageAddedReply = (
  message: string,
  msgsUsed: number
): WebhookEditMessageOptions => ({
  embeds: [
    new ConfirmEmbedBuilder()
      .setTitle('Message added')
      .setDescription(message)
      .setFooter({ text: `${msgsUsed} / 20 messages used` }),
  ],
  components: [getListMessagesActionRow()],
});
