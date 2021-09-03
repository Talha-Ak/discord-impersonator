const { RateLimitData, Client } = require('discord.js');
const tools = require('../tools');

/**
 * Log ratelimit error.
 * @param {RateLimitData} limitInfo
 * @param {Client} client
 */
const execute = async (limitInfo, client) => {
    console.log('Rate limited!');
    console.log(limitInfo);
};

/**
 * Event when the bot is ratelimited.
 */
module.exports = {
    name: 'rateLimit',
    execute,
};
