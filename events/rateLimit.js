const tools = require('../tools');

module.exports = async (client, limitInfo) => {
    console.log('Rate limited!');
    console.log(limitInfo);
    tools.sendToLogs(client, `Rate limited! Timeout: ${limitInfo.timeout}, limit: ${limitInfo.limit}, Path: ${limitInfo.path}, route: ${limitInfo.route}`);
};
