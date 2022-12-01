import { ButtonInfoType } from '../../interfaces/Button';
import { Button } from '../../structures/Button';
import { getMessagesListReply } from '../../utils/replies';

export default new Button({
    type: ButtonInfoType.MessageList,

    run: async ({ client, interaction }) => {
        await interaction.deferUpdate();

        // Assuming database entry exists here.
        // If not, something has gone horribly wrong.
        const guildInfo = await client.database.getGuildInfo(interaction.guild);
        if (!guildInfo) throw new Error('guildInfo null, but somehow used button.');

        interaction.editReply(getMessagesListReply(guildInfo.welcomeMsgs, interaction.guild.name));
    },
});
