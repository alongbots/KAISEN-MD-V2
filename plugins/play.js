const {
	plugin,sleep,extractUrlsFromString,searchYT,downloadMp3,downloadMp4,
	linkPreview,getYTInfo,getBuffer,AudioMetaData,toAudio,config,mode
} = require('../lib');
const yts = require("yt-search");
const axios = require("axios");

plugin({
	pattern: 'play',
	type: "downloader",
	desc: 'download youtube video',
	fromMe: mode
}, async (message, match) => {
	match = match || message.reply_message.text;
		if (!match) return await message.send('_give me some query_');
		const url = await extractUrlsFromString(match);
		if (!url[0]) {
			const result = await searchYT(match);
			if (!result[0]) return await message.send('_Not Found_');
			const {
				title,
				publishDate,
				viewCount,
				thumbnail
			} = await getYTInfo(result[0].url);
			return await message.sendReply(thumbnail, {
				caption: GenListMessage(title, ["• video", "• video document", "• audio", "• audio document"], false, "\n_Send number as reply to download_")
			}, "image");
		} else {
			const {
				title,
				publishDate,
				viewCount,
				thumbnail
			} = await getYTInfo(url[0]);
			return await message.sendReply(thumbnail, {
				caption: GenListMessage(title, ["• video", "• video document", "• audio", "• audio document"], false, "\n_Send number as reply to download_")
			}, "image");
		}
});
plugin({
	on: 'text',
	fromMe: mode
}, async (message, match) => {
	if (!message.reply_message?.fromMe || !message.reply_message?.text) return;
	if (!message.reply_message.text.includes('_Send number as reply to download_')) return;
		if (message.body.includes("• audio document")) {
			match = message.body.replace("• audio document", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp3(result[0].url);
			const AudioMeta = await AudioMetaData(await toAudio(ress),{title,image:thumbnail});
			return await message.client.sendMessage(message.from, {
				document: AudioMeta,
				mimetype: 'audio/mpeg',
				fileName: title.replaceAll(' ', '-') + ".mp3"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• audio")) {
			match = message.body.replace("• audio", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp3(result[0].url);
			const AudioMeta = await AudioMetaData(await toAudio(ress),{title,image:thumbnail});
			return await message.client.sendMessage(message.jid, {
				audio: AudioMeta,
				mimetype: 'audio/mpeg',
				fileName: title.replaceAll(' ', '-') + ".mp3"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• video document")) {
			match = message.body.replace("• video document", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp4(result[0].url);
			return await message.client.sendMessage(message.from, {
				document: ress,
				mimetype:  'video/mp4',
				fileName: title.replaceAll(' ', '-') + ".mp4"
			}, {
				quoted: message.data
			});
		} else if (message.body.includes("• video")) {
			match = message.body.replace("• video", "").trim();
			await message.send(`*_downloading:* ${match}_`);
			const result = await searchYT(match.replace('•', ''));
			const {
				seconds,
				title,
				thumbnail
			} = await getYTInfo(result[0].url);
		        const ress = await downloadMp4(result[0].url);
			return await message.client.sendMessage(message.from, {
				video: ress,
				mimetype: 'video/mp4',
				fileName: title.replaceAll(' ', '-') + ".mp4",
				caption: title
			}, {
				quoted: message.data
			});
		}
});

// New video download command
plugin({
	pattern: 'ong ?(.*)',
	fromMe: mode,
	desc: 'Search and download a song from YouTube as video',
	react: "🎵",
	type: "downloader"
}, async (message, match) => {
	try {
		match = match || message.reply_message?.text;
		if (!match) {
			return await message.send("Please provide a song name or YouTube link to download.", {linkPreview: linkPreview()});
		}

		let videoUrl = match;
		if (!match.includes("youtube.com") && !match.includes("youtu.be")) {
			await message.send("*🎐 𝐊ąìʂҽղ-𝐌𝐃 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐒𝐎𝐍𝐆...*", {linkPreview: linkPreview()});
			const searchResults = await yts(match);
			if (!searchResults.videos.length) {
				return await message.send("No results found for your query.", {linkPreview: linkPreview()});
			}
			videoUrl = searchResults.videos[0].url;
		}

		const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${videoUrl}`;
		const response = await axios.get(apiUrl);

		if (!response.data || !response.data.status || !response.data.result.url) {
			return await message.send("Failed to fetch the video. Try again later.", {linkPreview: linkPreview()});
		}

		const caption = `🎶 *Title:* ${response.data.result.title}\n🔗 *Link:* ${videoUrl}`;

		await message.send(response.data.result.url, {
			caption: caption,
			mimetype: 'video/mp4',
			linkPreview: linkPreview()
		}, 'video');

	} catch (e) {
		console.error("Error in ong command:", e);
		await message.send("An error occurred while processing your request.", {linkPreview: linkPreview()});
	}
});

// New audio download command
plugin({
	pattern: 'music ?(.*)',
	fromMe: mode,
	desc: 'Search and download audio from YouTube',
	react: "🎧",
	type: "downloader"
}, async (message, match) => {
	try {
		match = match || message.reply_message?.text;
		if (!match) {
			return await message.send("*𝐏ℓєα𝐬֟፝є 𝐏ʀ๏νιɖє 𝐀 𝐒๏ƞ͛g 𝐍αмє..*", {linkPreview: linkPreview()});
		}

		let videoUrl = match;
		if (!match.includes("youtube.com") && !match.includes("youtu.be")) {
			await message.send("*🎐 𝐊ąìʂҽղ-𝐌𝐃 𝐒𝐄𝐀𝐑𝐂𝐇𝐈𝐍𝐆 𝐒𝐎𝐍𝐆...*", {linkPreview: linkPreview()});
			const searchResults = await yts(match);
			if (!searchResults.videos.length) {
				return await message.send("No results found for your query.", {linkPreview: linkPreview()});
			}
			videoUrl = searchResults.videos[0].url;
		}

		const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${videoUrl}`;
		const response = await axios.get(apiUrl);

		if (!response.data || !response.data.success || !response.data.result.downloadUrl) {
			return await message.send("Failed to fetch the audio. Try again later.", {linkPreview: linkPreview()});
		}

		const caption = `🎵 *Title:* ${response.data.result.title}\n🔗 *Link:* ${videoUrl}`;

		await message.send(response.data.result.downloadUrl, {
			caption: caption,
			mimetype: "audio/mpeg",
			linkPreview: linkPreview()
		}, 'audio');

	} catch (e) {
		console.error("Error in music command:", e);
		await message.send("An error occurred while processing your request.", {linkPreview: linkPreview()});
	}
});