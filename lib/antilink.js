const { groupDB } = require('./index');

module.exports = async function handleAntilink(conn, msg) {
    try {
       if (!msg.message || !msg.key.remoteJid.endsWith('@g.us')) return;

        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const metadata = await conn.groupMetadata(jid);
        const admins = metadata.participants
            .filter(p => p.admin !== null)
            .map(p => p.id);
        const isAdmin = admins.includes(sender);
        const isBot = sender === conn.user.id;

        if (isAdmin || isBot) return; 

        console.log('Group JID:', jid);
        console.log('Sender:', sender);
        const data = await groupDB(['link'], { jid }, 'get');
        console.log('groupDB raw data:', data);
        const antilink = data?.link;
        console.log('Antilink settings:', antilink);

        if (!antilink || antilink.status !== 'true') return;

        const textMsg =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            '';

        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const links = textMsg.match(urlRegex);
        if (!links) return;

        const not_del = antilink.not_del || [];
        const filteredLinks = links.filter(l => !not_del.includes(l));
        if (!filteredLinks.length) return;
        const action = antilink.action || 'null';
        const warns = antilink.warns || {};
        const warnCount = warns[sender] || 0;

        if (action === 'null') {
            try {
                await conn.sendMessage(jid, { delete: msg.key });
               
            } catch (e) {
                console.error('❌ Failed to delete message:', e);
            }
            return;
        }

        if (action === 'warn') {
            const newWarn = warnCount + 1;
            warns[sender] = newWarn;
            await groupDB(['link'], {
                jid,
                content: { ...antilink, warns }
            }, 'set');

            if (newWarn >= 3) {
                try {
                    await conn.groupParticipantsUpdate(jid, [sender], 'remove');
                    await conn.sendMessage(jid, {
                        text: `❌ @${sender.split('@')[0]} removed for exceeding 3 warnings.`,
                        mentions: [sender]
                    });
                } catch (e) {
                    await conn.sendMessage(jid, {
                        text: `⚠️ Tried to kick @${sender.split('@')[0]} but failed.`,
                        mentions: [sender]
                    });
                }
            } else {
                await conn.sendMessage(jid, {
                    text: `⚠️ @${sender.split('@')[0]}, please avoid sharing links. Warning ${newWarn}/3`,
                    mentions: [sender]
                });
            }
            return;
        }

        if (action === 'kick') {
            try {
                await conn.groupParticipantsUpdate(jid, [sender], 'remove');
                await conn.sendMessage(jid, {
                    text: `❌ @${sender.split('@')[0]} removed for sharing a link.`,
                    mentions: [sender]
                });
            } catch (e) {
                await conn.sendMessage(jid, {
                    text: `⚠️ Tried to kick @${sender.split('@')[0]} but failed.`,
                    mentions: [sender]
                });
            }
        }

    } catch (err) {
        console.error('❌ Antilink Error:', err);
    }
};