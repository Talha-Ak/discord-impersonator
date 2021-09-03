const Guild = require('./schema');

/**
 * Functions relating to database accesses.
 */
module.exports = async client => {

    // Finds and returns the db object that has a matching guild ID.
    client.getGuildfromDb = async guild => {
        const data = await Guild.findOne({ guildID: guild.id }).exec();
        if (data) {
            return data;
        } else {
            return await client.createGuildInDb({ guildID: guild.id });
        }
    };

    // Creates a new db document with the guild's ID and some default settings.
    client.createGuildInDb = async settings => {
        const guildInfo = Object.assign(client.config.defaultSettings, settings);
        const newGuild = new Guild(guildInfo);
        return await newGuild.save();
    };

    // Compares the differences between the original object and new object, and updates the db with the new object.
    client.updateGuildInDb = async (guild, settings) => {
        let guildInfo = await client.getGuildfromDb(guild);

        if (typeof guildInfo !== 'object') guildInfo = {};
        for (const key in settings) {
            if (guildInfo[key] !== settings[key]) guildInfo[key] = settings[key];
        }
        console.log(`Updated guild ${guildInfo.guildID}`);
        return await guildInfo.updateOne(settings).exec();
    };

    // Deletes the db object associated with the guild.
    client.deleteGuildInDb = async (guild) => {
        return await Guild.deleteOne({ guildID: guild.id }).exec();
    };
};
