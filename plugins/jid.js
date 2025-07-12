
const {
    plugin,
    mode
} = require('../lib');

plugin({
    pattern: 'jid',
    fromMe: mode,
    desc: 'Get the JID of the user or group',
    react: "📍",
    type: "group"
}, async (message, match) => {
    try {
        // If it's a group, reply with the group JID
        if (message.isGroup) {
            return await message.send(`*ɢʀᴏᴜᴘ ᴊɪᴅ:* *${message.jid}*`);
        }

        // If it's a personal chat, reply with the user's JID
        if (!message.isGroup) {
            return await message.send(`*User JID:* *${message.sender}*`);
        }

    } catch (e) {
        console.error("Error:", e);
        await message.send(`❌ An error occurred: ${e.message}`);
    }
});

plugin({
    pattern: 'jid2',
    fromMe: mode,
    desc: 'Get the JID of the user or group (alternative)',
    react: "📍",
    type: "group"
}, async (message, match) => {
    try {
        // If the message is from a group
        if (message.isGroup) {
            // Respond with the group JID
            return await message.send(`*ɢʀᴏᴜᴘ ᴊɪᴅ:* *${message.jid}*`);
        }

        // If it's a personal chat, respond with the user's JID
        if (!message.isGroup) {
            return await message.send(`*User JID:* *${message.sender}*`);
        }

    } catch (e) {
        console.error("Error:", e);
        await message.send(`❌ An error occurred: ${e.message}`);
    }
});
