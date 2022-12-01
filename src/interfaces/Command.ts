import type { ApplicationCommandDataResolvable, ChatInputCommandInteraction, Guild, GuildMember, GuildTextBasedChannel, SharedNameAndDescription } from 'discord.js';
import type { ImpersonatorClient } from '../structures/Client';

/**
 * Interface to narrow interaction typing to more appropriate types.
 */
export interface ExtendedCommandInteraction extends ChatInputCommandInteraction<'cached'> {
    member: GuildMember;
    guild: Guild;
    channel: GuildTextBasedChannel;
}

interface RunOptions {
    client: ImpersonatorClient,
    interaction: ExtendedCommandInteraction,
}

interface CommandInfo extends SharedNameAndDescription {
    toJSON: () => ApplicationCommandDataResolvable;
}

export interface CommandData {
    /** Time between command executions per guild - in milliseconds. */
    cooldown?: number,
    private?: boolean,
    info: CommandInfo
    run: (options: RunOptions) => Promise<void>;
}
