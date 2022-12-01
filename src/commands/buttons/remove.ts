import { ButtonInfoType } from '../../interfaces/Button';
import { Button } from '../../structures/Button';
import { ErrorEmbedBuilder } from '../../structures/Embed';
import { getMessageRemovedReply } from '../../utils/replies';

export default new Button({
  type: ButtonInfoType.MessageRemove,
  run: async ({ client, interaction, info: message }) => {
    await interaction.deferUpdate();

    // Assuming database entry exists here.
    // If not, something has gone horribly wrong.
    const guildInfo = await client.database.getGuildInfo(interaction.guild);
    if (!guildInfo) throw new Error('guildInfo null, but somehow used button.');

    let messageIndex = -1;
    messageIndex = guildInfo.welcomeMsgs.indexOf(message);

    if (messageIndex === -1) {
      interaction.update({
        embeds: [
          new ErrorEmbedBuilder()
            .setTitle('Something went wrong...')
            .setDescription('This message couldn\'t be deleted.'),
        ],
      });
      return;
    }

    guildInfo.welcomeMsgs.splice(messageIndex, 1);

    await client.database.updateGuildInfo(guildInfo);
    interaction.editReply(
      getMessageRemovedReply(
        message,
        messageIndex + 1,
        guildInfo.welcomeMsgs.length
      )
    );
  },
});
