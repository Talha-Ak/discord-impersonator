import { PermissionFlagsBits, Webhook } from 'discord.js';

import { client } from '..';
import { Event } from '../structures/Event';

export default new Event('guildMemberAdd', async (member) => {
  const botMember = await member.guild.members.fetchMe();
  if (!botMember.permissions.has(PermissionFlagsBits.ManageWebhooks)) return;

  let webhook: Webhook;
  let guildInfo = await client.database.getGuildInfo(member.guild);
  if (!guildInfo) {
    try {
      ({ webhook, guildInfo } = await client.repairInfo(member.guild));
    } catch (err) {
      console.error('GMA error', err);
      return;
    }
  }

  if (guildInfo.welcomeMsgs.length < 1) return;

  try {
    webhook ??= await client.fetchDbWebhook(member.guild, guildInfo);
  } catch (error) {
    console.log(error);
    return;
  }

  if (guildInfo.channelID && webhook.channelId !== guildInfo.channelID) {
    try {
      await webhook.edit({
        name: client.config.webhookDefaults.name,
        avatar: client.config.webhookDefaults.avatar,
        channel: guildInfo.channelID,
        reason: `Executing welcome message for new member ${member.user.tag}`,
      });
    } catch (error) {
      console.error(error);
    }
  }

  await webhook.send({
    username: member.displayName,
    avatarURL: member.displayAvatarURL(),
    content:
      guildInfo.welcomeMsgs[
        Math.floor(Math.random() * guildInfo.welcomeMsgs.length)
      ],
  });
});
