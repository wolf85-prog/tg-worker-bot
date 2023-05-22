require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_API_TOKEN
const bot = new TelegramBot(token, {polling: true});

// web-приложение
const webAppUrl = process.env.WEB_APP_URL;


let workerId, workerName, dateBorn, Worklist;

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(cors());

// Certificate
const privateKey = fs.readFileSync('privkey.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);


//--------------------------------------------------------------------------------------------------------
//              REQUEST
//--------------------------------------------------------------------------------------------------------

//создание страницы (проекта) базы данных проектов
app.post('/web-data', async (req, res) => {
    const {queryId, workerfamily} = req.body;
    // const d = new Date(dateborn);
    // const year = d.getFullYear();
    // const month = String(d.getMonth()+1).padStart(2, "0");
    // const day = String(d.getDate()).padStart(2, "0");

    try {

            console.log("Начинаю сохранять данные по заявке...")
            workerName = workerfamily
 
            console.log("Сохранение данных завершено: ", workerName)
            
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Специалист успешно добавлен',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Специалист успешно добавлен!
  
<b>Фамилия:</b> ${workerfamily} 
<b>Дата рождения:</b> 
  
<b>Специальности:</b>`  
// ${worklist.map(item =>' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}
            }
        })
  
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})



bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Я принял ваш запрос!')
})

//-------------------------------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8001;

const start = async () => {
    try {
        
        httpsServer.listen(PORT, () => {
            console.log('HTTPS Server BotWorker running on port ' + PORT);
        });

    } catch (error) {
        console.log('Ошибка!', error.message)
    }
}

start()