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
    desc: 'Manage anti-link settings',
    type: 'manage',
    onlyGroup: true,
    fromMe: true
}, async (message, match) => {
   
   const data = await groupDB(['link'], { jid: message.jid }, 'get');
const current = data.link || { status: 'false', action: 'null', not_del: [], warns: {} };

if (!match) {
    return await message.reply(
        `_*Antilink Settings:*_\n\n` +
        `• antilink on/off\n` +
        `• antilink action warn/kick/null\n` +
        `• antilink not_del <url>\n\n` +
        `*Current Settings:*\n` +
        `• *Status:* ${current.status === 'true' ? 'ON' : 'OFF'}\n` +
        `• *Action:* ${current.action === 'null' ? 'None' : current.action}\n` +
        `• *Not Delete URLs:* ${current.not_del.length > 0 ? current.not_del.join(', ') : 'None'}`
      
    );
}

    match = match.trim().toLowerCase();

    if (match === 'on') {
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, status: 'true' }
        }, 'set');
        return await message.send(`✅ Antilink activated with action *${current.action}*`);
    }

    if (match === 'off') {
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, status: 'false' }
        }, 'set');
        return await message.send(`❌ Antilink deactivated`);
    }

    if (match.startsWith('action')) {
        const action = match.replace('action', '').trim();
        if (!actions.includes(action)) {
            return await message.send('❗ Invalid action! Use: `warn`, `kick`, or `null`');
        }

        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, action }
        }, 'set');
        return await message.send(`✅ Antilink action set to *${action}*`);
    }

    if (match.startsWith('not_del')) {
        const url = match.replace('not_del', '').trim();
        if (!url.startsWith('http')) {
            return await message.send('❗ Please provide a valid URL');
        }

        const list = current.not_del || [];
        if (list.includes(url)) {
            return await message.send('⚠️ URL is already in the ignore list');
        }

        list.push(url);
        await groupDB(['link'], {
            jid: message.jid,
            content: { ...current, not_del: list }
        }, 'set');
        return await message.send('✅ URL added to ignore list');
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
