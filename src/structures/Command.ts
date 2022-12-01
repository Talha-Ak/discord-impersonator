import type { CommandData } from '../interfaces/Command';

export class Command {
    constructor(options: CommandData) {
        Object.assign(this, options);
    }
}
