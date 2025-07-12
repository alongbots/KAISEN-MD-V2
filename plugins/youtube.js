
const {
	plugin, sleep, extractUrlsFromString, searchYT, downloadMp3, downloadMp4,
	linkPreview, getYTInfo, getBuffer, AudioMetaData, toAudio, config, mode
} = require('../lib');

plugin({
	pattern: 'song',
	fromMe: mode,
	type: "downloader",
	desc: 'Download audio from YouTube'
}, async (message, match) => {
	try {
		match = match || message.reply_message?.text;
		if (!match) return await message.send('_Which song?_\n_eg: .song Arabic Kuthu_');
		
		const url = await extractUrlsFromString(match);
		if (!url[0]) {
			const result = await searchYT(match);
			if (!result[0]) return await message.send('_Not found_');
			
			return await message.send({
				name: 'YOUTUBE SONG DOWNLOADER',
				values: result.splice(0, 10).map(a => ({
					name: a.title,
					id: `song ${a.url}`
				})),
				withPrefix: true,
				onlyOnce: false,
				participates: [message.sender],
				selectableCount: true
			}, {}, 'poll');
		} else {
			await message.send('*🎵 Downloading audio... Please wait.*');
			
			const ytInfo = await getYTInfo(url[0]);
			if (!ytInfo) {
				return await message.send('❌ Failed to get video information.');
			}
			
			const {
				seconds,
				title,
				thumbnail
			} = ytInfo;
			
			const ress = await downloadMp3(url[0]);
			if (ress === "rejected") {
				return await message.send('❌ Failed to download audio. Please try again.');
			}
			
			const AudioMeta = await AudioMetaData(await toAudio(ress), {
				title,
				image: thumbnail
			});
			
			return await message.send(AudioMeta, {
				mimetype: 'audio/mpeg',
				linkPreview: linkPreview({
					title,
					url: thumbnail
				})
			}, 'audio');
		}
	} catch (error) {
		console.error('Song download error:', error);
		await message.send('❌ An error occurred while downloading the song.');
	}
});

plugin({
	pattern: 'video',
	fromMe: mode,
	type: "downloader",
	desc: 'Download video from YouTube'
}, async (message, match) => {
	try {
		match = match || message.reply_message?.text;
		if (!match) return await message.send('*Use : .video Al Quran!*');
		
		const url = await extractUrlsFromString(match);
		if (!url[0]) {
			const result = await searchYT(match);
			if (!result[0]) return await message.send('_Not found_');
			
			return await message.send({
				name: 'YOUTUBE VIDEO DOWNLOADER',
				values: result.splice(0, 10).map(a => ({
					name: a.title,
					id: `video ${a.url}`
				})),
				withPrefix: true,
				onlyOnce: false,
				participates: [message.sender],
				selectableCount: true
			}, {}, 'poll');
		} else {
			await message.send('*🎬 Downloading video... Please wait.*');
			
			const ress = await downloadMp4(url[0]);
			if (ress === "rejected") {
				return await message.send('❌ Failed to download video. Please try again.');
			}
			
			await message.send(ress, {
				mimetype: 'video/mp4'
			}, 'video');
		}
	} catch (error) {
		console.error('Video download error:', error);
		await message.send('❌ An error occurred while downloading the video.');
	}
});
