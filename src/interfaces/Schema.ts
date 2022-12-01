import mongoose, { InferSchemaType, Schema } from 'mongoose';
import config from '../config';

// export interface GuildDoc extends Document {
//     guildID: string;
//     webhookID?: string;
//     roleID?: string;
//     channelID?: string;
//     prefix?: string | undefined;
//     welcomeMsgs?: Types.Array<string>;
//     schemaVersion?: number;
// }

const guildSchema = new Schema({
    guildID: { type: String, required: true },
    webhookID: String,
    roleID: String,
    channelID: String,
    prefix: {
        type: String,
        default: '.',
    },
    welcomeMsgs: {
        type: [String],
        default: config.welcomeDefaults,
    },
    schemaVersion: {
        type: Number,
        default: config.schemaVersion,
    },
});

export type GuildDoc = InferSchemaType<typeof guildSchema>;

export const GuildModel = mongoose.model<GuildDoc>('Guild', guildSchema);
