
const {
    plugin,
    mode,
    extractUrlsFromString,
    isInstagramURL
} = require('../lib');
const axios = require('axios');

plugin({
    pattern: 'ig ?(.*)',
    fromMe: mode,
    desc: 'Download Instagram videos and images',
    react: "🎥",
    type: 'downloader'
}, async (message, match) => {
    try {
        // Get URL from match or reply message
        match = match || message.reply_message.text;
        if (!match) {
            return await message.send("❌ Please provide a valid Instagram link.");
        }

        // Extract URLs from the input
        const urls = extractUrlsFromString(match);
        if (!urls[0]) {
            return await message.send("❌ No valid URL found in your message.");
        }

        // Check if it's an Instagram URL
        if (!isInstagramURL(urls[0])) {
            return await message.send("❌ Please provide a valid Instagram link.");
        }

        // Send loading reaction
        await message.send("⏳ Downloading Instagram content...");

        // Fetch from API
        const response = await axios.get(`https://delirius-apiofc.vercel.app/download/instagram?url=${urls[0]}`);
        const data = response.data;

        if (!data || data.status !== 200 || !data.downloadUrl) {
            return await message.send("⚠️ Failed to fetch Instagram content. Please check the link and try again.");
        }

        // Send the downloaded content
        await message.sendFromUrl(data.downloadUrl, "", "📥 *DOWNLOAD SUCCESSFULLY!*");

    } catch (error) {
        console.error("Instagram download error:", error);
        await message.send("❌ An error occurred while processing your request. Please try again.");
    }
});
