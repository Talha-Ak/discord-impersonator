import { EmbedBuilder } from 'discord.js';
import { client } from '..';

/**
 * Embed builder with preset "error" color.
 */
export class ErrorEmbedBuilder extends EmbedBuilder {
    constructor() {
        super({ color: client.config.colours.warn });
    }
}

export class ConfirmEmbedBuilder extends EmbedBuilder {
    constructor() {
        super({ color: client.config.colours.confirm });
    }
}

export class NeutralEmbedBuilder extends EmbedBuilder {
    constructor() {
        super({ color: client.config.colours.gray });
    }
}
