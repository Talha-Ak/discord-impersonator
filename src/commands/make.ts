import {
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  RESTJSONErrorCodes,
} from 'discord-api-types/v10';
import {
  ActionRowBuilder,
  AnyThreadChannel,
  ButtonBuilder,
  DiscordAPIError,
  GuildTextBasedChannel,
  inlineCode,
  NewsChannel,
  SlashCommandBuilder,
  TextChannel,
  ThreadChannel,
  Webhook,
  WebhookMessageOptions,
} from 'discord.js';

import { Command } from '../structures/Command';
import { ConfirmEmbedBuilder, ErrorEmbedBuilder } from '../structures/Embed';

export default new Command({
  info: new SlashCommandBuilder()
    .setName('make')
    .setDescription('Create a custom message')
    .setDMPermission(false)
    .addStringOption(opt =>
      opt
        .setName('name')
        .setDescription('The name the message is sent from')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('image')
        .setDescription('The URL of the image to show (.jpg/.png)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('message')
        .setDescription('The message to send')
        .setRequired(true)
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
    const sendingName = interaction.options.getString('name', true);
    let sendingImage = interaction.options.getString('image', true);
    if (!sendingImage.startsWith('http')) {
      sendingImage = `https://${sendingImage}`;
    }
    const sendingMessage = interaction.options.getString('message', true);
    let sendingChannel = interaction.options.getChannel('channel');
    sendingChannel = (sendingChannel ?? interaction.channel) as
      | TextChannel
      | AnyThreadChannel;

    // Format args to valid webhook properties.
    const formattedProps = getWebhookProps(
      sendingName,
      sendingImage,
      sendingChannel
    );

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
          reason: `Executing "make" command from ${interaction.user.tag}`,
        });
      } catch (error) {
        console.error(error);
        interaction.editReply({
          embeds: [
            new ErrorEmbedBuilder()
              .setTitle('Something went wrong...')
              .setDescription('Unable to edit the webhook details.'),
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

    try {
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
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        error.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType
      ) {
        interaction.editReply({
          embeds: [
            new ErrorEmbedBuilder()
              .setTitle('Something went wrong...')
              .setDescription('Discord did not accept that URL as an avatar.'),
          ],
        });
      } else {
        console.error(error);
      }
    }
  },
});

const getWebhookProps = (
  name: string,
  avatarUrl: string,
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
    name: name.replace(/clyde/gi, 'clyed'),
    avatar: avatarUrl,
    isThread,
    channel: isThread ? parentChannel : (channel as TextChannel | NewsChannel),
  };
};
