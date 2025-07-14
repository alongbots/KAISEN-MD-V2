
const {
    plugin,
    groupDB,
    isAdmin,
    isBotAdmin
} = require('../lib');

const actions = ['warn', 'kick', 'null'];

// Command handler for antilink configuration
plugin({
    pattern: 'antilink ?(.*)',
    desc: 'Manage anti-link settings for the group',
    react: '🔗',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    try {
        if (!await isBotAdmin(message)) {
            return await message.reply('❌ Bot must be admin to use antilink features');
        }

        // Get current antilink settings
        const result = await groupDB(['link'], { jid: message.jid }, 'get');
        let current;
        
        try {
            current = result?.link ? JSON.parse(result.link) : { status: 'false', action: 'warn', not_del: [], warns: {} };
        } catch (e) {
            current = { status: 'false', action: 'warn', not_del: [], warns: {} };
        }

        if (!match) {
            const status = current.status === 'true' ? 'ON' : 'OFF';
            const allowedUrls = current.not_del && current.not_del.length > 0 ? current.not_del.join(', ') : 'none';
            return await message.reply(
                `*🔗 ANTILINK STATUS*\n\n` +
                `📊 Status: ${status}\n` +
                `⚡ Action: ${current.action}\n` +
                `✅ Allowed URLs: ${allowedUrls}\n\n` +
                `*Usage:*\n` +
                `• \`.antilink on\` - Enable antilink\n` +
                `• \`.antilink off\` - Disable antilink\n` +
                `• \`.antilink action warn\` - Set warn action\n` +
                `• \`.antilink action kick\` - Set kick action\n` +
                `• \`.antilink action null\` - Set null action\n` +
                `• \`.antilink not_del <url>\` - Add/remove allowed URL`
            );
        }

        const args = match.trim().split(' ');
        const command = args[0].toLowerCase();

        if (command === 'on') {
            current.status = 'true';
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(current)
            }, 'set');
            return await message.send(`✅ *AntiLink has been activated*\n🎯 Action: ${current.action}\n⚠️ Warning limit: 3`);
        }

        if (command === 'off') {
            current.status = 'false';
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(current)
            }, 'set');
            return await message.send(`❌ *AntiLink has been deactivated*`);
        }

        if (command === 'action') {
            const action = args[1];
            if (!action || !actions.includes(action)) {
                return await message.send('❌ Invalid action. Use: `warn`, `kick`, or `null`');
            }

            current.action = action;
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(current)
            }, 'set');
            return await message.send(`✅ *AntiLink action updated to: ${action}*`);
        }

        if (command === 'not_del') {
            const url = args.slice(1).join(' ').trim();
            if (!url) {
                return await message.send('❌ Please provide a URL\n\nExample: `.antilink not_del https://youtube.com`');
            }

            // Clean URL
            const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
            
            if (!current.not_del) current.not_del = [];
            
            const index = current.not_del.findIndex(u => 
                u.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase() === cleanUrl
            );
            
            if (index === -1) {
                current.not_del.push(cleanUrl);
                await groupDB(['link'], {
                    jid: message.jid,
                    content: JSON.stringify(current)
                }, 'set');
                return await message.send(`✅ *URL added to whitelist:* ${cleanUrl}`);
            } else {
                current.not_del.splice(index, 1);
                await groupDB(['link'], {
                    jid: message.jid,
                    content: JSON.stringify(current)
                }, 'set');
                return await message.send(`❌ *URL removed from whitelist:* ${cleanUrl}`);
            }
        }

        return await message.send('❌ Invalid command. Use `.antilink` to see usage');

    } catch (error) {
        console.log('Antilink command error:', error);
        return await message.send('❌ Error in antilink command. Please try again.');
    }
});

// Event handler for detecting and processing links
plugin({
    on: 'all'
}, async (message) => {
    try {
        // Only process group messages
        if (!message.isGroup || message.fromMe) return;
        
        // Skip if no text content
        const text = message.text || message.displayText || '';
        if (!text) return;

        // Get antilink settings
        const result = await groupDB(['link'], { jid: message.jid }, 'get');
        let antilink;
        
        try {
            antilink = result?.link ? JSON.parse(result.link) : null;
        } catch (e) {
            antilink = null;
        }
        
        // Skip if antilink is not enabled
        if (!antilink || antilink.status !== 'true') return;

        // Skip if bot is not admin
        if (!await isBotAdmin(message)) return;
        
        // Skip if sender is admin
        if (await isAdmin(message)) return;

        // Check for links in message
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,}[^\s]*)/gi;
        const links = text.match(urlRegex) || [];
        
        if (links.length === 0) return;

        const not_del = antilink.not_del || [];
        let hasBlockedLink = false;

        // Check if any link is not whitelisted
        for (const link of links) {
            const cleanLink = link.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
            
            const isWhitelisted = not_del.some(allowed => {
                const cleanAllowed = allowed.toLowerCase();
                return cleanLink.includes(cleanAllowed) || cleanAllowed.includes(cleanLink);
            });
            
            if (!isWhitelisted) {
                hasBlockedLink = true;
                break;
            }
        }

        if (!hasBlockedLink) return;

        const action = antilink.action || 'warn';
        const sender = message.sender;
        const senderNumber = sender.split('@')[0];

        // Delete the message
        try {
            await message.client.sendMessage(message.jid, { delete: message.key });
        } catch (e) {
            console.log('Failed to delete message:', e);
        }

        if (action === 'null') {
            await message.send(`⚠️ *Link detected!*\n👤 User: @${senderNumber}\n📝 Message deleted`, {
                mentions: [sender]
            });
            return;
        }

        if (action === 'kick') {
            try {
                await message.client.groupParticipantsUpdate(message.jid, [sender], 'remove');
                await message.send(`❌ *User removed for sharing link*\n👤 User: @${senderNumber}`, {
                    mentions: [sender]
                });
            } catch (e) {
                await message.send(`⚠️ *Failed to remove user*\n👤 User: @${senderNumber}\n❗ Make sure bot is admin`, {
                    mentions: [sender]
                });
            }
            return;
        }

        if (action === 'warn') {
            // Initialize warns if not exists
            if (!antilink.warns) antilink.warns = {};
            
            const warnCount = (antilink.warns[sender] || 0) + 1;
            antilink.warns[sender] = warnCount;
            
            // Save updated warns
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(antilink)
            }, 'set');

            if (warnCount >= 3) {
                try {
                    await message.client.groupParticipantsUpdate(message.jid, [sender], 'remove');
                    await message.send(
                        `❌ *User removed after 3 warnings*\n` +
                        `👤 User: @${senderNumber}\n` +
                        `⚠️ Reason: Sharing links after warnings`, 
                        { mentions: [sender] }
                    );
                    
                    // Reset warnings after kick
                    delete antilink.warns[sender];
                    await groupDB(['link'], {
                        jid: message.jid,
                        content: JSON.stringify(antilink)
                    }, 'set');
                    
                } catch (e) {
                    await message.send(
                        `⚠️ *Failed to remove user after 3 warnings*\n` +
                        `👤 User: @${senderNumber}\n` +
                        `❗ Make sure bot is admin`, 
                        { mentions: [sender] }
                    );
                }
            } else {
                const remaining = 3 - warnCount;
                await message.send(
                    `⚠️ *Warning ${warnCount}/3*\n` +
                    `👤 User: @${senderNumber}\n` +
                    `📝 Reason: Links not allowed\n` +
                    `🔢 Remaining warnings: ${remaining}`, 
                    { mentions: [sender] }
                );
            }
        }

    } catch (error) {
        console.log('Antilink event error:', error);
    }
});
