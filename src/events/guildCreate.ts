import {
  channelMention,
  hyperlink,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';

import { client } from '..';
import { ErrorEmbedBuilder, NeutralEmbedBuilder } from '../structures/Embed';
import { Event } from '../structures/Event';

export default new Event('guildCreate', async (guild) => {
  const availableChannel = await client.getAvailableTextChannel(guild);

  // Abort setup - no text channel found. When a command/event is triggered, it will be re-attempted.
  if (!availableChannel) return;

  if (
    !(await guild.members.fetchMe()).permissions.has(
      PermissionFlagsBits.ManageWebhooks
    )
  ) {
    availableChannel.send({
      embeds: [
        new ErrorEmbedBuilder().setTitle('Missing permissions!').setDescription(
          `impersonator needs the \`Manage Webhooks\` permission to edit the name and avatar of the webhook created.
                
                Impersonation **will not work** until the permission is granted.
                This can be done by allowing the \`impersonator\` role to \`Manage Webhooks\` on this server.`
        ),
      ],
    });
    return;
  }

  try {
    const webhook = await availableChannel.createWebhook({
      name: client.config.webhookDefaults.name,
      avatar: client.config.webhookDefaults.avatar,
      reason: 'Impersonator webhook setup',
    });

    await client.database.createGuildInfo(guild, webhook);

    availableChannel.send({
      embeds: [await getWelcomeEmbed(availableChannel, client.config)],
    });
  } catch (error) {
    console.error(error);
  }
});

const getWelcomeEmbed = async (
  channel: TextChannel,
  config: { owners: string[]; supportServerUrl: string }
) =>
  new NeutralEmbedBuilder()
    .setTitle('Thanks for adding impersonator')
    .setDescription(
      `Welcome messages will be sent to ${channelMention(channel.id)}
            
            The channel can be changed using /setchannel.
            Anytime a new person joins the server, a random message is sent in their name.
            Start adding messages with /add.`
    )
    .addFields(
      {
        name: 'Developers',
        value: (
          await Promise.all(
            config.owners.map(async id => (await client.users.fetch(id)).tag)
          )
        ).join(' + '),
        inline: true,
      },
      {
        name: 'Video tutorial',
        value: `${hyperlink('YouTube', 'https://youtu.be/VMD_GDEzA38')}`,
        inline: true,
      },
      {
        name: 'Support server',
        value: `${hyperlink('Discord', config.supportServerUrl)}`,
        inline: true,
      },
      {
        name: 'Get Started!',
        value: 'Try /help to see what you can do.',
      }
    )
    .setFooter({
      text: `This is impersonator's ${client.guilds.cache.size}${getOrdinalStr(
        client.guilds.cache.size
      )} server`,
    });

// https://stackoverflow.com/a/39466341
const getOrdinalStr = (n: number) =>
  [null, 'st', 'nd', 'rd'][(n / 10) % 10 ^ 1 && n % 10] ?? 'th';
