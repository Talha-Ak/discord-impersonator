const Guild = require('./schema');

/**
 * Functions relating to database accesses.
 */
module.exports = client => {

    // Finds and returns the db object that has a matching guild ID.
    client.getGuildfromDb = async guild => {
        const data = await Guild.findOne({ guildID: guild.id });
        if (data) return data;
        else return client.config.defaultSettings;
    };

    // Creates a new db document with the guild's ID and some default settings.
    client.createGuildInDb = async settings => {
        const guildInfo = Object.assign(client.config.defaultSettings, settings);
        const newGuild = await new Guild(guildInfo);
        return newGuild.save();
    };

    // Compares the differences between the original object and new object, and updates the db with the new object.
    client.updateGuildInDb = async (guild, settings) => {
        let guildInfo = await client.getGuildfromDb(guild);

        if (typeof guildInfo !== 'object') guildInfo = {};
        for (const key in settings) {
            if (guildInfo[key] !== settings[key]) guildInfo[key] = settings[key];
        }
        console.log(`Updated guild ${guildInfo.guildID}`);
        return await guildInfo.updateOne(settings);
    };

    // Deletes the db object associated with the guild.
    client.deleteGuildInDb = async (guild) => {
        return await Guild.deleteOne({ guildID: guild.id });
    };
};
