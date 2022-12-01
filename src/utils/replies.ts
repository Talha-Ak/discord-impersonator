import { ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, InteractionUpdateOptions, underscore, WebhookEditMessageOptions } from 'discord.js';
import { ButtonInfoType } from '../interfaces/Button';
import { ConfirmEmbedBuilder, NeutralEmbedBuilder } from '../structures/Embed';

export const getMessageRemovedReply = (message: string, idx: number, msgsUsed: number): WebhookEditMessageOptions & InteractionUpdateOptions => ({
    embeds: [new ConfirmEmbedBuilder()
        .setTitle(`Message ${idx} removed`)
        .setDescription(message)
        .setFooter({ text: `${msgsUsed} / 20 messages used` }),
    ],
    components: [getListMessagesActionRow()],
});

export const getMessagesListReply = (messages: string[], guildName: string): WebhookEditMessageOptions & InteractionUpdateOptions => {
    let description = underscore('These are your welcome messages') + '\n';

    messages.forEach((message, i) => {
        // why 79? i have no idea anymore. something about fitting in one line.
        description += `${i + 1}: ${message.length > 82 ? message.substring(0, 79) + '...' : message}\n`;
    });
    description += '\n';

    description += (
        `A random message from this list will be sent when someone joins.
        View a full message with /list ${inlineCode('position')}
        Remove a message with /remove ${inlineCode('position')}`
    );

    return {
        embeds: [new NeutralEmbedBuilder()
            .setTitle(`Welcome messages for ${guildName}`)
            .setDescription(description)
            .setFooter({ text: `${messages.length}/20 messages` }),
        ],
        components: [],
    };
};

export const getListMessagesActionRow = () =>
    new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(JSON.stringify({ type: ButtonInfoType.MessageList }))
                .setLabel('List messages')
                .setStyle(ButtonStyle.Secondary)
        );
