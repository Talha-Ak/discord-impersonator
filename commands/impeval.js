const { Client, Message } = require('discord.js');

/**
 * Provides eval command to bot owners.
 * Command format: impeval <code>
 * @param {Client} client
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (client, message, args) => {

    // Only allow bot owners to use command.
    if (!client.config.owners.includes(message.author.id)) return;

    const code = args.join(' ');

    try {
        const evaled = eval(code);
        const clean = await cleanOutput(client, evaled);

        // If output exceeds Discord message limit, export output to file.
        const MAX_CHARS = 3 + 2 + clean.length + 3;
        if (MAX_CHARS > 2000) {
            return message.channel.send('Output exceeded 2000 chars. Output exported to file.', {
                files: [{
                    attachment: Buffer.from(clean),
                    name: 'output.txt',
                }],
            });
        }

        return message.channel.send(clean, { code: 'js' });
    } catch (err) {
        message.channel.send(await cleanOutput(client, err), { code: 'bash' });
    }
};

// Cleans the output from any private content.
async function cleanOutput(client, text) {
    if (text && text.constructor.name == 'Promise') text = await text;
    if (typeof text !== 'string') text = require('util').inspect(text);

    // Prevent mentions from happening, hide any token leak.
    text = text
        .replace(client.token, 'REDACTED')
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203));

    return text;
}
