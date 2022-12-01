import type { ClientEvents } from 'discord.js';

/**
 * Key-value event class where the Key (type) is retrieved from discord.js emitted events,
 * and the value (run) is the function that should be executed from that event.
 */
export class Event<Key extends keyof ClientEvents> {
    constructor(
        public type: Key,
        public run: (...args: ClientEvents[Key]) => Promise<void>
    ) {}
}
