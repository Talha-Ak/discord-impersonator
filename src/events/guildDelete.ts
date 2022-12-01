import { client } from '..';
import { Event } from '../structures/Event';

export default new Event('guildDelete', async (guild) => {
  await client.database.deleteGuildInfo(guild);
});
