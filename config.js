const toBool = (x) => x == 'true'
const { existsSync } = require('fs')
const { Sequelize } = require('sequelize');
if (existsSync('config.env')) require('dotenv').config({ path: './config.env' })
process.env.NODE_OPTIONS = '--max_old_space_size=2560'//2.5
const DB_URL =  process.env.DATABASE_URL || '';
module.exports = {
    SESSION_ID: process.env.SESSION_ID || '', //your ssid to run bot
    HEROKU: {
        API_KEY: process.env.HEROKU_API_KEY,
        APP_NAME: process.env.HEROKU_APP_NAME
    },
    MENU_FONT: '29;26',
    PORT: process.env.PORT || 3000,
    BASE_URL : "https://kaisen-md/support",
    REPO: "?",
    BGM_URL : process.env.BGM_URL || "null",
    ANTI_CALL : process.env.ANTI_CALL || 'false',//true,block
    ALLWAYS_ONLINE: toBool(process.env.ALLWAYS_ONLINE || "false"),
    PM_BLOCK : process.env.PM_BLOCK || "false",//badword, all, spam:10 for spamming 10 block
    BGMBOT : toBool(process.env.BGMBOT || "false"),
    STATUS_VIEW: process.env.STATUS_VIEW || "false",
    SAVE_STATUS: toBool(process.env.SAVE_STATUS || "false"),
    DISABLE_PM: toBool(process.env.DISABLE_PM || "false"),
    DISABLE_GRP : toBool(process.env.DISABLE_GRP || "false"),
    ERROR_MSG : toBool(process.env.ERROR_MSG || "true"),
    AJOIN: toBool(process.env.AJOIN || 'false'),
    READ : process.env.READ ||  "false",//true, command
    CHATBOT : process.env.CHATBOT || "false",//true, pm, group
    REACT : process.env.REACT || "true",//true, command, emoji
    WARNCOUND : process.env.WARNCOUND || 5,
    BOT_INFO : process.env.BOT_INFO || "KAISEN-BOT-MD;kaisen;https://files.catbox.moe/tzdb08.mp4",
    WORKTYPE : process.env.WORKTYPE || "public",
    CMD_NAME : process.env.CMD_NAME || "KAISEN-BOT",
    PREFIX : process.env.PREFIX || "[.,!]",//both  .  and [.] equal, for multi prefix we use [] this
    PERSONAL_MESSAGE: process.env.PERSONAL_MESSAGE || "null",
    BOT_PRESENCE : process.env.BOT_PRESENCE || "unavailable",
    AUDIO_DATA : process.env.AUDIO_DATA || "KAISEN-BOT-MD;bot;https://i.imgur.com/DyLAuEh.jpg",
    STICKER_DATA : process.env.STICKER_DATA || "KAISEN;bot",
    LIST_TYPE: process.env.LIST_TYPE || 'poll',//list, reaction 
    LINK_PREVIEW: process.env.LINK_PREVIEW || 'KAISEN;Bot;https://graph.org/file/1ec147e94d9775916e665.jpg',//you can use "false" alslo
    API_TYPE: process.env.API_TYPE || 'all',//unique
    BRAINSHOP: process.env.BRAINSHOP || '172372,nbjE0YAlyw3cpoMl',
    SUDO : process.env.SUDO || "null",
    RMBG_KEY: process.env.RMBG_KEY,
    OPEN_AI: process.env.OPEN_AI,
    ELEVENLABS: process.env.ELEVENLABS,
    DATABASE: DB_URL ? new Sequelize(DB_URL,{dialect:'postgres',ssl:true,protocol: 'postgres', dialectOptions: {native: true,ssl:{require: true,rejectUnauthorized: false}}, logging: false}) : new Sequelize({dialect:'sqlite',storage:'./database.db',logging:false}) 
};



