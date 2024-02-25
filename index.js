require("dotenv").config();

const TelegramBot =  require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

const options = {
    polling : true
}

const fanBot = new TelegramBot(token, options);

// command
const prefix = "/"
const start = new RegExp(`^${prefix}start$`)
const gempa = new RegExp(`^${prefix}gempa$`)
const news = new RegExp(`^${prefix}news$`)

// start
fanBot.onText(start , (callback) => {
    fanBot.sendMessage(callback.from.id, 
        `
Halo, ${callback.from.first_name} !!!
Gunakan command dibawah :
/gempa : untuk melihat data gempa terkini
/news : untuk melihat berita teratas
`)
});

// gempa
fanBot.onText(gempa , async(callback) => {
    const processingMessage = await fanBot.sendMessage(callback.from.id, "Permintaan sedang diproses...");
    
    const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";
    const apiCall = await fetch(BMKG_ENDPOINT + "autogempa.json");
    const {
        Infogempa: {
            gempa: {
                Tanggal, Jam, Magnitude, Wilayah, Potensi, Kedalaman, Shakemap
            }
        }
    } = await apiCall.json();
    const BMKGImage = BMKG_ENDPOINT + Shakemap
    const resultText = `
===== INFO GEMPA TERKINI =====
Waktu : ${Tanggal} , ${Jam}
Magnitude : ${Magnitude} SR
Kedalaman : ${Kedalaman}
Wilayah : ${Wilayah}
Potensi : ${Potensi}
`
    fanBot.sendPhoto(callback.from.id, BMKGImage, {
        caption: resultText
    })
    fanBot.deleteMessage(callback.from.id, processingMessage.message_id);
});

// news
fanBot.onText(news , async(callback) => {
    const newsApiKey = process.env.NEWSAPI_KEY
    const NEWS_ENDPOINT = `https://newsapi.org/v2/top-headlines?country=id&apiKey=${newsApiKey}`;
    const processingMessage = await fanBot.sendMessage(callback.from.id, "Permintaan sedang diproses...");
    try {
        const apiCall = await fetch(NEWS_ENDPOINT);
        const response = await apiCall.json();
        const articles = response.articles.slice(0, 3);
        
        articles.forEach(article => {
            const { author, title, url } = article;
            const resultText = `
 ===== INFO BERITA TERATAS =====
 Judul : ${title}
 Author : ${author}
 URL : ${url}
 `;
            fanBot.sendMessage(callback.from.id, resultText);
        });
        fanBot.deleteMessage(callback.from.id, processingMessage.message_id);
    } catch (error) {
        console.error("Error fetching news:", error);
        fanBot.deleteMessage(callback.from.id, processingMessage.message_id);
        fanBot.sendMessage(callback.from.id, "Maaf, terjadi kesalahan saat mengambil berita.");
    }
});