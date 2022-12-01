import {
  inlineCode,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { Command } from '../structures/Command';
import { ErrorEmbedBuilder } from '../structures/Embed';
import { getMessageRemovedReply } from '../utils/replies';

export default new Command({
  info: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a welcome message')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption(opt =>
      opt
        .setName('position')
        .setDescription('The position of the message to delete')
        .setRequired(true)
        .setMinValue(1)
    ),

  run: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });
    const msgIdx = interaction.options.getInteger('position', true) - 1;

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

    const deletedMsg = guildInfo.welcomeMsgs[msgIdx];

    if (!deletedMsg) {
      interaction.editReply({ embeds: [getMessageNotExistEmbed(msgIdx + 1)] });
      return;
    }

    guildInfo.welcomeMsgs.splice(msgIdx, 1);

    await client.database.updateGuildInfo(guildInfo);
    interaction.editReply(
      getMessageRemovedReply(
        deletedMsg,
        msgIdx + 1,
        guildInfo.welcomeMsgs.length
      )
    );
  },
});

const getMessageNotExistEmbed = (idx: number) =>
  new ErrorEmbedBuilder()
    .setTitle('Invalid position')
    .setDescription(`No message at position ${idx} was found.`)
    .setFooter({ text: '/list to see all messages' });
