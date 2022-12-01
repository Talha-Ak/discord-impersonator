import {
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  ButtonBuilder,
  GuildMember,
  GuildTextBasedChannel,
  inlineCode,
  NewsChannel,
  SlashCommandBuilder,
  TextChannel,
  ThreadChannel,
  userMention,
  Webhook,
  WebhookMessageOptions,
} from 'discord.js';

import { Command } from '../structures/Command';
import { ConfirmEmbedBuilder, ErrorEmbedBuilder } from '../structures/Embed';

export default new Command({
  info: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Say a message as another user')
    .setDMPermission(false)
    .addUserOption(opt =>
      opt
        .setName('user')
        .setDescription('User to send the message as')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('message').setDescription('Message to send').setRequired(true)
    )
    .addChannelOption(opt =>
      opt
        .setName('channel')
        .setDescription('Channel to send message in')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildPublicThread,
          ChannelType.GuildPrivateThread
        )
    ),

  run: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });

    // Check if we can edit webhooks.
    if (!interaction.appPermissions?.has(PermissionFlagsBits.ManageWebhooks)) {
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

    // Gather command args.
    const taggedMember = interaction.options.getMember('user');
    const sendingMessage = interaction.options.getString('message', true);
    let sendingChannel = interaction.options.getChannel('channel');
    sendingChannel = (sendingChannel ??
      interaction.channel) as GuildTextBasedChannel;

    if (!taggedMember) {
      interaction.editReply({
        embeds: [
          new ErrorEmbedBuilder()
            .setTitle('Something went wrong...')
            .setDescription(
              'Could not find the person you mentioned in the command.'
            ),
        ],
      });
      return;
    }

    // Format args to valid webhook properties.
    const formattedProps = getWebhookProps(taggedMember, sendingChannel);

    const guildInfo = await client.database.getGuildInfo(interaction.guild);

    // Find or fetch webhook from guild.
    let webhook: Webhook;
    try {
      webhook = await client.fetchDbWebhook(interaction.guild, guildInfo);
    } catch (error) {
      interaction.editReply({
        embeds: [
          new ErrorEmbedBuilder()
            .setTitle('Something went wrong...')
            .setDescription('Couldn\'t fetch webhook data from Discord.'),
        ],
      });
      return;
    }

    // Edit webhook if channel is different to what user specified.
    if (webhook.channelId !== formattedProps.channel.id) {
      try {
        await webhook.edit({
          name: client.config.webhookDefaults.name,
          avatar: client.config.webhookDefaults.avatar,
          channel: formattedProps.channel,
          reason: `Executing "say" command from ${interaction.user.tag}`,
        });
      } catch (error) {
        console.error(error);
        interaction.editReply({
          embeds: [
            new ErrorEmbedBuilder()
              .setTitle('Something went wrong...')
              .setDescription(
                `Unable to edit the webhook to ${userMention(
                  taggedMember.displayName
                )}'s details.`
              ),
          ],
        });
        return;
      }
    }

    // Send the custom message.
    const webhookSend: WebhookMessageOptions = {
      username: formattedProps.name,
      avatarURL: formattedProps.avatar,
      content: sendingMessage,
    };
    if (formattedProps.isThread) webhookSend['threadId'] = sendingChannel.id;

    const msg = await webhook.send(webhookSend);

    interaction.editReply({
      embeds: [
        new ConfirmEmbedBuilder().setDescription(
          `Message sent to ${sendingChannel}`
        ),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('View message')
            .setStyle(ButtonStyle.Link)
            .setURL(msg.url)
        ),
      ],
    });
  },
});

const getWebhookProps = (
  member: GuildMember,
  channel: GuildTextBasedChannel
) => {
  const isThread =
    channel.type === ChannelType.GuildPrivateThread ||
    channel.type === ChannelType.GuildPublicThread;
  const parentChannel =
    (channel as ThreadChannel).parent ?? (channel as TextChannel | NewsChannel);
  return {
    // Webhooks are not allowed to be named 'clyde' and must be renamed if so.
    // https://discord.com/developers/docs/resources/webhook#create-webhook
    name: member.displayName.replace(/clyde/gi, 'clyed'),
    avatar: member.displayAvatarURL(),
    isThread,
    channel: isThread ? parentChannel : (channel as TextChannel | NewsChannel),
  };
};
