import type { ButtonInteraction, Guild, GuildMember, GuildTextBasedChannel } from 'discord.js';
import type { ImpersonatorClient } from '../structures/Client';

export enum ButtonInfoType {
    MessageRemove = 'BUTTON_MESSAGE_REMOVE',
    MessageList = 'BUTTON_MESSAGE_LIST',
}

interface MessageCommandButtonListInfo {
    type: ButtonInfoType.MessageList;
    data: never;
}

interface MessageCommandButtonRemoveInfo {
    type: ButtonInfoType.MessageRemove;
    data: string;
}

export type MessageCommandButtonInfo = MessageCommandButtonListInfo | MessageCommandButtonRemoveInfo;

export interface ExtendedButtonInteraction extends ButtonInteraction {
    member: GuildMember;
    guild: Guild;
    channel: GuildTextBasedChannel;
}

interface RunOptions {
    client: ImpersonatorClient;
    interaction: ExtendedButtonInteraction;
    info: string;
}

export interface ButtonData {
    type: ButtonInfoType
    run: (options: RunOptions) => Promise<void>;
}
