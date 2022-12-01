import { Collection, inlineCode, time } from 'discord.js';

import { client } from '..';
import type {
  ExtendedButtonInteraction,
  MessageCommandButtonInfo,
} from '../interfaces/Button';
import type { ExtendedCommandInteraction } from '../interfaces/Command';
import { ErrorEmbedBuilder } from '../structures/Embed';
import { Event } from '../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
  // Ignore other types of interactions for now.
  if (!interaction.guild) return;

  if (interaction.isChatInputCommand() && interaction.inCachedGuild()) {
    // If command doesn't exist, return early (shouldn't happen...)
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      interaction.reply({
        embeds: [
          new ErrorEmbedBuilder()
            .setTitle('Something went wrong...')
            .setDescription('This command doesn\'t seem to exist.'),
        ],
        ephemeral: true,
      });
      return;
    }

    // Check (and return early) if guild still in cooldown.
    if (command.cooldown) {
      const commandCooldowns = client.cooldowns.ensure(
        command.info.name,
        () => new Collection()
      );
      const now = new Date();
      const nextTimeToUse = commandCooldowns.get(interaction.guild.id) ?? now;

      if (now < nextTimeToUse) {
        interaction.reply({
          embeds: [
            new ErrorEmbedBuilder().setDescription(
              `${inlineCode(`/${command.info.name}`)} available ${time(
                nextTimeToUse,
                'R'
              )}`
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      // Potential memory issue, guilds aren't cleared after cooldown over.
      commandCooldowns.set(
        interaction.guild.id,
        new Date(now.getTime() + command.cooldown)
      );
    }

    try {
      command.run({
        client,
        interaction: interaction as ExtendedCommandInteraction,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        embeds: [
          new ErrorEmbedBuilder()
            .setTitle('Something went wrong...')
            .setDescription(
              'Something went wrong trying to run that command. Try again later.'
            ),
        ],
      });
    }
  } else if (interaction.isButton()) {
    const buttonInfo: MessageCommandButtonInfo = JSON.parse(
      interaction.customId
    );
    const button = client.buttons.get(buttonInfo.type);

    if (!button) {
      interaction.reply({
        embeds: [
          new ErrorEmbedBuilder()
            .setTitle('Something went wrong...')
            .setDescription('This button isn\'t valid anymore.'),
        ],
        ephemeral: true,
      });
      return;
    }

    button.run({
      client,
      interaction: interaction as ExtendedButtonInteraction,
      info: buttonInfo.data,
    });
  }
});
