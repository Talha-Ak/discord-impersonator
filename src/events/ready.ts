import { ActivityType } from 'discord.js';

import { client } from '..';
import { Event } from '../structures/Event';

/**
 * Emitted when the bot successfully connects to Discord.
 */
export default new Event('ready', async () => {
    client.user?.setActivity('for /help', { type: ActivityType.Watching });
    console.log(`Connected to Discord as ${client.user?.tag}`);
});
