import {
  ChannelType,
  Client,
  ClientEvents,
  Collection,
  DiscordAPIError,
  GatewayIntentBits,
  Guild,
  PermissionFlagsBits,
  RESTJSONErrorCodes,
  Snowflake,
  TextChannel,
  Webhook,
} from 'discord.js';
import { readdirSync } from 'fs';
import type { HydratedDocument } from 'mongoose';

import configFile from '../config';
import { DatabaseClient } from './Database';
import type { ButtonData, ButtonInfoType } from '../interfaces/Button';
import type { CommandData } from '../interfaces/Command';
import type { GuildDoc } from '../interfaces/Schema';
import type { Event } from './Event';

export class ImpersonatorClient extends Client {
  /**
   * The commands loaded by the client.
   */
  commands = new Collection<string, CommandData>();

  /**
   * The button interactions loaded by the client.
   */
  buttons = new Collection<ButtonInfoType, ButtonData>();

  /**
   * The current cooldowns per command per guild.
   */
  cooldowns = new Collection<string, Collection<Snowflake, Date>>();

  /**
   * Settings configured through config.ts.
   */
  readonly config = configFile;

  /**
   * Handles database transactions.
   */
  database = new DatabaseClient(process.env.DATABASE_URL);

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildWebhooks,
      ],
    });
  }

  start() {
    this.registerModules();
    this.login();
  }

  async registerModules() {
    // Register commands
    const commandFlies = readdirSync(`${__dirname}/../commands`).filter(
      file => file.endsWith('.js')
    );
    for (const file of commandFlies) {
      console.log(`Registering command ${file}`);
      const command: CommandData = (await import(`../commands/${file}`))
        .default;
      this.commands.set(command.info.name, command);
    }

    // ADD SERVER ID TO THIS LINE                            vvvvvvvvvvvv
    this.on('ready', async () => await this.registerCommands('1234567890'));

    // Register button interactions
    const buttonFiles = readdirSync(`${__dirname}/../commands/buttons`).filter(
      file => file.endsWith('.js')
    );
    for (const file of buttonFiles) {
      console.log(`Registering button interaction ${file}`);
      const button: ButtonData = (await import(`../commands/buttons/${file}`))
        .default;
      this.buttons.set(button.type, button);
    }

    // Register events
    const eventFlies = readdirSync(`${__dirname}/../events`).filter(file =>
      file.endsWith('.js')
    );
    for (const file of eventFlies) {
      console.log(`Registering event ${file}`);
      const event: Event<keyof ClientEvents> = (
        await import(`../events/${file}`)
      ).default;
      this.on(event.type, event.run);
    }
  }

  async registerCommands(guildId?: string) {
    const publicSlashCommands = this.commands.filter(cmd => !cmd.private);
    if (guildId) {
      await this.guilds.cache
        .get(guildId)
        ?.commands.set(this.commands.map(cmd => cmd.info.toJSON()));
      console.log(`Registered application commands to ${guildId}.`);
    }
    await this.application?.commands.set(
      publicSlashCommands.map(cmd => cmd.info.toJSON())
    );
    console.log('Registered global application commands.');
  }

  /**
   * Retrieve a text channel, prioritising those that allow the bot to send messages in.
   * @param guild The guild to get a TextChannel from.
   * @returns A text channel within the guild, or undefined if not found.
   */
  async getAvailableTextChannel(guild: Guild) {
    const welcomeMessagePermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ManageWebhooks,
    ];

    const botMember = await guild.members.fetchMe();

    if (
      guild.systemChannel
        ?.permissionsFor(botMember)
        .has(welcomeMessagePermissions)
    ) {
      return guild.systemChannel;
    }

    const guildTextChannels = guild.channels.cache.filter(
      (c): c is TextChannel => c.type === ChannelType.GuildText
    );
    const channel =
      guildTextChannels.find(c =>
        c.permissionsFor(botMember).has(welcomeMessagePermissions)
      ) ?? guildTextChannels.first();
    if (!channel) throw new Error('No text channels');
    return channel;
  }

  /**
   * Fetch webhook object using a database document. Assumes permission check for MANAGE_WEBHOOKS.
   * @param guild The guild to retreive the webhook from.
   * @param guildInfo The database document of this guild.
   * @returns The webhook object that the document points to.
   */
  async fetchDbWebhook(
    guild: Guild,
    guildInfo: HydratedDocument<GuildDoc> | null
  ) {
    let webhook: Webhook | null = null;

    if (guildInfo?.webhookID) {
      try {
        webhook = await this.fetchWebhook(guildInfo.webhookID);
      } catch (error) {
        if (
          !(error instanceof DiscordAPIError) ||
          error.code !== RESTJSONErrorCodes.UnknownWebhook
        ) {
          console.error(error);
          throw error;
        }
      }
    }

    if (!webhook) ({ webhook } = await this.repairInfo(guild, guildInfo));
    return webhook;
  }

  /**
   * Repairs guild's database info, in the event there is no entry OR the webhook is not found.
   * @param guild The guild to repair.
   * @param guildInfo The database entry of this guild.
   */
  async repairInfo(
    guild: Guild,
    guildInfo?: HydratedDocument<GuildDoc> | null
  ) {
    // Find / create webhook
    const guildWebhooks = await guild.fetchWebhooks();
    let foundWebhook = guildWebhooks.find(hook =>
      hook.applicationId ? hook.applicationId === this.application?.id : false
    );

    if (!foundWebhook) {
      const channel = await this.getAvailableTextChannel(guild);
      foundWebhook = await channel.createWebhook({
        name: this.config.webhookDefaults.name,
        avatar: this.config.webhookDefaults.avatar,
        reason: 'Impersonator webhook setup',
      });
    }

    // Update / create database entry.
    let doc: HydratedDocument<GuildDoc>;
    if (guildInfo) {
      guildInfo.webhookID = foundWebhook.id;
      doc = await this.database.updateGuildInfo(guildInfo);
    } else {
      doc = await this.database.createGuildInfo(guild, foundWebhook);
    }

    return { webhook: foundWebhook, guildInfo: doc };
  }
}
