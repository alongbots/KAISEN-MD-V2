const {
    plugin,
    groupDB
} = require('../lib');
const actions = ['kick','warn','null']


plugin({
    pattern: 'antiword ?(.*)',
    desc: 'remove users who use restricted words',
    type: "manage",
    onlyGroup: true,
    fromMe: true 
}, async (message, match) => {
    if (!match) return await message.reply("_*antiword* on/off_\n_*antiword* action warn/kick/null_");
    const {antiword} = await groupDB(['word'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'get') {
    	const status = antiword && antiword.status == 'true' ? true : false
        if(!status  || !antiword.word) return await message.send('_Not Found_');
        return await message.send(`_*activated antiwords*: ${antiword.word}_`);
    } else if(match.toLowerCase() == 'on') {
    	const action = antiword && antiword.action ? antiword.action : 'null';
        const word = antiword && antiword.word ? antiword.word : undefined;
        await groupDB(['word'], {jid: message.jid, content: {status: 'true', action, word}}, 'set');
        return await message.send(`_antiword Activated with action null_\n_*antiword action* warn/kick/null for chaning actions_`)
    } else if(match.toLowerCase() == 'off') {
    	const action = antiword && antiword.action ? antiword.action : 'null';
        const word = antiword && antiword.word ? antiword.word : undefined;
        await groupDB(['word'], {jid: message.jid, content: {status: 'false', action,word }}, 'set')
        return await message.send(`_antiword deactivated_`)
    } else if(match.toLowerCase().match('action')) {
    	const status = antiword && antiword.status ? antiword.status : 'false';
        match = match.replace(/action/gi,'').trim();
        if(!actions.includes(match)) return await message.send('_action must be warn,kick or null_')
        await groupDB(['word'], {jid: message.jid, content: {status, action: match }}, 'set')
        return await message.send(`_antiword Action Updated_`);
    } else {
    	if(!match) return await message.send('_*Example:* antiword 🏳️‍🌈, gay, nigga_');
    	const status = antiword && antiword.status ? antiword.status : 'false';
        const action = antiword && antiword.action ? antiword.action : 'null';
        await groupDB(['word'], {jid: message.jid, content: {status, action,word: match}}, 'set')
        return await message.send(`_Antiwords Updated_`);
    }
});

plugin({
    pattern: 'antilink ?(.*)',
    desc: '🛡️ Manage anti-link settings',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {

    const data = await groupDB(['link'], { jid: message.jid }, 'get');
    const current = data.link || {
        status: 'false',
        action: 'null',
        not_del: [],
        warns: {},
        warn_count: 3
    };

    const rawMatch = match?.trim(); 
    const lowerMatch = rawMatch?.toLowerCase(); 
    const actions = ['null', 'warn', 'kick'];
   if (lowerMatch === 'reset') {
        await groupDB(['link'], {
            jid: message.jid,
            content: {
                status: 'false',
                action: 'null',
                not_del: [],
                warns: {},
                warn_count: 3
            }
        }, 'set');
        return await message.send('♻️ *Antilink settings have been reset to default!*');
    }
    if (!rawMatch) {
        return await message.reply(
            `*🔗 Antilink Settings*\n\n` +
            `• 📎 *Status:* ${current.status === 'true' ? '✅ ON' : '❌ OFF'}\n` +
            `• ⚔️ *Action:* ${current.action === 'null' ? '🚫 Null' : current.action === 'warn' ? '⚠️ Warn' : '❌ Kick'}\n` +
            `• 🚨 *Warn Before Kick:* ${current.warn_count}\n` +
            `• 📤 *Ignore URLs:* ${(current.not_del?.length > 0) ? current.not_del.join(', ') : 'None'}\n\n` +
            `🛠️ *Commands:*\n` +
            `• antilink on/off\n` +
            `• antilink action warn/kick/null\n` +
            `• antilink set_warn <number>\n` +
            `• antilink not_del <url>\n` +
            `• antilink reset`
        );
    }
    if (lowerMatch === 'on') {
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, status: 'true' }
        }, 'set');
        return await message.send(`✅ Antilink activated with action *${current.action}*`);
    }
    if (lowerMatch === 'off') {
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, status: 'false' }
        }, 'set');
        return await message.send(`❌ Antilink deactivated`);
    }
    if (lowerMatch.startsWith('action')) {
        const action = rawMatch.replace(/action/i, '').trim().toLowerCase();
        if (!actions.includes(action)) {
            return await message.send('❗ Invalid action! Use: `warn`, `kick`, or `null`');
        }

        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, action }
        }, 'set');
        return await message.send(`⚙️ Antilink action set to *${action}*`);
    }

    if (lowerMatch.startsWith('set_warn')) {
        const count = parseInt(rawMatch.replace(/set_warn/i, '').trim());
        if (isNaN(count) || count < 1 || count > 10) {
            return await message.send('❗ Please provide a valid number between 1 and 10');
        }

        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, warn_count: count }
        }, 'set');
        return await message.send(`🚨 Antilink warning count set to *${count}*`);
    }
    if (lowerMatch.startsWith('not_del')) {
        const url = rawMatch.replace(/not_del/i, '').trim();
        if (!url.startsWith('http')) {
            return await message.send('❗ Please provide a valid URL (must start with http)');
        }
       const list = current.not_del || [];
        if (list.some(link => link.toLowerCase() === url.toLowerCase())) {
            return await message.send('⚠️ URL is already in the ignore list');
        }
     list.push(url);
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, not_del: list }
        }, 'set');
     return await message.send('✅ URL added to ignore list (case preserved)');
    }
     return await message.send('⚠️ Invalid usage. Type `antilink` to see help.');
});

plugin({
    pattern: 'antifake ?(.*)',
    desc: 'remove fake numbers',
    fromMe: true,
    react: '🖕',
    type: 'manage',
    onlyGroup: true
}, async (message, match) => {
    if (!match) return await message.reply('_*antifake* 94,92_\n_*antifake* on/off_\n_*antifake* list_');
    const {antifake} = await groupDB(['fake'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase()=='get'){
    if(!antifake || antifake.status == 'false' || !antifake.data) return await message.send('_Not Found_');
    return await message.send(`_*activated restricted numbers*: ${antifake.data}_`);
    } else if(match.toLowerCase() == 'on') {
    	const data = antifake && antifake.data ? antifake.data : '';
    	await groupDB(['fake'], {jid: message.jid, content: {status: 'true', data}}, 'set');
        return await message.send(`_Antifake Activated_`)
    } else if(match.toLowerCase() == 'off') {
        const data = antifake && antifake.data ? antifake.data : '';
    	await groupDB(['fake'], {jid: message.jid, content: {status: 'false', data}}, 'set');
    return await message.send(`_Antifake Deactivated_`)
    }
    match = match.replace(/[^0-9,!]/g, '');
    if(!match) return await message.send('value must be number');
    const status = antifake && antifake.status ? antifake.status : 'false';
    await groupDB(['fake'], {jid: message.jid, content: {status, data: match}}, 'set');
    return await message.send(`_Antifake Updated_`);
});

plugin({
    pattern: 'antidelete ?(.*)',
    desc: 'forward deleted messages',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('antidelete on/off');
    if (match != 'on' && match != 'off') return message.reply('antidelete on');
    const {antidelete} = await groupDB(['delete'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (antidelete == 'true') return message.reply('_Already activated_');
        await groupDB(['delete'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_activated_')
    } else if (match == 'off') {
        if (antidelete == 'false') return message.reply('_Already Deactivated_');
        await groupDB(['delete'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_deactivated_')
    }
});

plugin({
    pattern: 'antibot ?(.*)',
    desc: 'remove users who use bot',
    type: "manage",
    onlyGroup: true,
    fromMe: true 
}, async (message, match) => {
    if (!match) return await message.reply("_*antibot* on/off_\n_*antibot* action warn/kick/null_");
    const {antibot} = await groupDB(['bot'], {jid: message.jid, content: {}}, 'get');
    if(match.toLowerCase() == 'on') {
    	const action = antibot && antibot.action ? antibot.action : 'null';
        await groupDB(['bot'], {jid: message.jid, content: {status: 'true', action }}, 'set');
        return await message.send(`_antibot Activated with action null_\n_*antibot action* warn/kick/null for chaning actions_`)
    } else if(match.toLowerCase() == 'off') {
    	const action = antibot && antibot.action ? antibot.action : 'null';
        await groupDB(['bot'], {jid: message.jid, content: {status: 'false', action }}, 'set')
        return await message.send(`_antibot deactivated_`)
    } else if(match.toLowerCase().match('action')) {
    	const status = antibot && antibot.status ? antibot.status : 'false';
        match = match.replace(/action/gi,'').trim();
        if(!actions.includes(match)) return await message.send('_action must be warn,kick or null_')
        await groupDB(['bot'], {jid: message.jid, content: {status, action: match }}, 'set')
        return await message.send(`_AntiBot Action Updated_`);
    }
});

plugin({
    pattern: 'antidemote ?(.*)',
    desc: 'demote actor and re-promote demoted person',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('antidemote on/off');
    if (match != 'on' && match != 'off') return message.reply('antidemote on');
    const {antidemote} = await groupDB(['demote'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (antidemote == 'true') return message.reply('_Already activated_');
        await groupDB(['demote'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_activated_')
    } else if (match == 'off') {
        if (antidemote == 'false') return message.reply('_Already Deactivated_');
        await groupDB(['demote'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_deactivated_')
    }
});

plugin({
    pattern: 'antipromote ?(.*)',
    desc: 'demote actor and re-promote demoted person',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
    if (!match) return message.reply('antipromote on/off');
    if (match != 'on' && match != 'off') return message.reply('antipromote on');
    const {antipromote} = await groupDB(['promote'], {jid: message.jid, content: {}}, 'get');
    if (match == 'on') {
        if (antipromote == 'true') return message.reply('_Already activated_');
        await groupDB(['promote'], {jid: message.jid, content: 'true'}, 'set');
        return await message.reply('_activated_')
    } else if (match == 'off') {
        if (antipromote == 'false') return message.reply('_Already Deactivated_');
        await groupDB(['promote'], {jid: message.jid, content: 'false'}, 'set');
        return await message.reply('_deactivated_')
    }
});
