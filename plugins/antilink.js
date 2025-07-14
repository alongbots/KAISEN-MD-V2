const actions = ['warn', 'kick', 'null'];

const {
  plugin
} = require('../lib');

plugin({
    pattern: 'antilink ?(.*)',
    desc: 'Manage anti-link settings',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    const { antilink } = await groupDB(['link'], { jid: message.jid, content: {} }, 'get');
    const current = antilink || { status: 'false', action: 'null', not_del: [], warns: {} };

    if (!match)
        return await message.reply(
            '_*antilink* on/off_\n' +
            '_*antilink action* warn/kick/null_\n' +
            '_*antilink not_del* <url>_'
        );

    match = match.trim().toLowerCase();

    if (match === 'on') {
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, status: 'true' }
        }, 'set');
        return await message.send(`_Antilink activated with action ${current.action}_`);
    }

    if (match === 'off') {
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, status: 'false' }
        }, 'set');
        return await message.send(`_Antilink deactivated_`);
    }

    if (match.startsWith('action')) {
        const action = match.replace('action', '').trim();
        if (!actions.includes(action)) return await message.send('_Invalid action! Use: warn/kick/null_');

        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, action }
        }, 'set');
        return await message.send(`_Antilink action updated to ${action}_`);
    }

    if (match.startsWith('not_del')) {
        const url = match.replace('not_del', '').trim();
        if (!url.startsWith('http')) return await message.send('_Please provide a valid URL_');

        const list = current.not_del || [];
        if (list.includes(url)) return await message.send('_URL already whitelisted_');

        list.push(url);
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, not_del: list }
        }, 'set');
        return await message.send('_URL added to ignore list_');
    }
});