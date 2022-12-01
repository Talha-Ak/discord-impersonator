import type { Guild, Webhook } from 'discord.js';
import mongoose, { ConnectOptions, HydratedDocument } from 'mongoose';

import { GuildDoc, GuildModel } from '../interfaces/Schema';

export class DatabaseClient {
    private dbOptions: ConnectOptions = {
        autoIndex: false,
    };

    constructor(private databaseUrl: string) {
        this.registerEventHandlers();
        console.log('Connecting to MongoDB server...');
        mongoose.connect(this.databaseUrl, this.dbOptions).catch(error => console.error(error));
    }

    async getGuildInfo(guild: Guild) {
        const data = await GuildModel.findOne({ guildID: guild.id }).exec();
        return data;
    }

    async createGuildInfo(guild: Guild, webhook: Webhook) {
        const newGuild = new GuildModel({
            guildID: guild.id,
            webhookID: webhook.id,
            channelID: webhook.channelId,
        });
        return await newGuild.save();
    }

    async updateGuildInfo(guildInfo: HydratedDocument<GuildDoc>) {
        return await guildInfo.save();
    }

    async deleteGuildInfo(guild: Guild) {
        return await GuildModel.deleteOne({ guildID: guild.id }).exec();
    }

    private registerEventHandlers() {
        const { connection } = mongoose;
        connection.on('connected', () => console.log('Connected to MongoDB server.'));
        connection.on('error', err => console.error(`MongoDB connection error. ${err}`));
        connection.on('disconnected', () => console.log('Disconnected from MongoDB server.'));
    }

}
