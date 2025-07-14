
const { plugin } = require('../lib');
const { groupDB } = require('../lib/database');

const actions = ['warn', 'kick', 'null'];

plugin({
    pattern: 'antilink ?(.*)',
    desc: 'Manage anti-link settings',
     react: '🍄',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    try {
        // Get current antilink settings
        const result = await groupDB(['link'], { jid: message.jid }, 'get');
        let current;
        
        try {
            current = result?.link ? JSON.parse(result.link) : { status: 'false', action: 'null', not_del: [], warns: {} };
        } catch (e) {
            current = { status: 'false', action: 'null', not_del: [], warns: {} };
        }

        if (!match) {
            const status = current.status === 'true' ? 'on' : 'off';
            const allowedUrls = current.not_del && current.not_del.length > 0 ? current.not_del.join(', ') : 'none';
            return await message.reply(
                `AntiLink is currently: ${status}.\n` +
                `Action: ${current.action}\n` +
                `Allowed URLs: ${allowedUrls}\n\n` +
                `Use \`.antilink on/off/info/action warn/kick/null/not_del <url>\`.`
            );
        }

        match = match.trim().toLowerCase();

        if (match === 'on') {
            current.status = 'true';
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(current)
            }, 'set');
            return await message.send(`AntiLink has been activated with action ${current.action}`);
        }

        if (match === 'off') {
            current.status = 'false';
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(current)
            }, 'set');
            return await message.send(`AntiLink has been deactivated`);
        }

        if (match === 'info') {
            const status = current.status === 'true' ? 'enabled' : 'disabled';
            const allowedUrls = current.not_del && current.not_del.length > 0 ? current.not_del.join(', ') : 'none';
            return await message.send(
                `🔒 Status: ${status}\n` +
                `✅ Allowed URLs: ${allowedUrls}\n` +
                `⚠️ Action on violation: ${current.action}`
            );
        }

        if (match.startsWith('action')) {
            const action = match.replace('action', '').trim();
            if (!actions.includes(action)) {
                return await message.send('❌ Invalid action. Use: `warn`, `kick`, or `null`.');
            }

            current.action = action;
            await groupDB(['link'], {
                jid: message.jid,
                content: JSON.stringify(current)
            }, 'set');
            return await message.send(`✅ AntiLink action updated to: ${action}`);
        }

        if (match.startsWith('not_del')) {
            const url = match.replace('not_del', '').trim();
            if (!url || !url.includes('.')) {
                return await message.send('_Please provide a valid URL or domain_');
            }

            const list = current.not_del || [];
            const index = list.indexOf(url);
            
            if (index === -1) {
                list.push(url);
                current.not_del = list;
                await groupDB(['link'], {
                    jid: message.jid,
                    content: JSON.stringify(current)
                }, 'set');
                return await message.send(`_URL added to whitelist: ${url}_`);
            } else {
                list.splice(index, 1);
                current.not_del = list;
                await groupDB(['link'], {
                    jid: message.jid,
                    content: JSON.stringify(current)
                }, 'set');
                return await message.send(`_URL removed from whitelist: ${url}_`);
            }
        }
    } catch (error) {
        console.log('Antilink plugin error:', error);
        return await message.send('_Error in antilink command. Please try again._');
    }
});
