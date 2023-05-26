require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_API_TOKEN
const bot = new TelegramBot(token, {polling: true});

// web-приложение
const webAppUrl = process.env.WEB_APP_URL;
const socketUrl = process.env.SOCKET_APP_URL
const chatTelegramId = process.env.CHAT_ID
const chatGiaId = process.env.GIA_ID

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;

//socket.io
const {io} = require("socket.io-client")

let workerId, workerFam, workerName2, phone2, dateBorn, Worklist, city2, stag2, companys2;

const sendMyMessage = require('./botworker/common/sendMyMessage')

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
const router = require('./botworker/routes/index')

//подключение к БД PostreSQL
const sequelize = require('./botworker/connections/db')
const {UserBot, Message, Conversation, Worker} = require('./botworker/models/models')

app.use(express.json());
app.use(cors());
app.use('/', router)

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
    const {queryId, workerfamily, workerName, phone, worklist, 
        city, dateborn, companys, stag} = req.body;
    const d = new Date(dateborn);
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    try {

        if (worklist.length > 0) {

            console.log("Начинаю сохранять данные по заявке...")
            workerFam = workerfamily
            workerName2 = workerName
            phone2 = phone
            dateBorn = dateborn
            phone2 = phone
            city2 = city
            stag2 = stag
            companys2 = companys
            Worklist = worklist 
            console.log("Сохранение данных завершено: ", workerFam)
            
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Специалист успешно добавлен',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Специалист успешно добавлен!
  
<b>Фамилия:</b> ${workerfamily} 
<b>Имя:</b> ${workerName} 
<b>Телефон:</b> ${phone} 
<b>Дата рождения:</b> ${day}.${month}.${year}

<b>Город:</b> ${city} 
<b>Компании:</b> ${companys} 
<b>Опыт работы:</b> ${stag} 
  
<b>Специальности:</b> 
${worklist.map(item =>' - ' + item.spec + ', ' + item.cat).join('\n')}`
            }
            })

        }
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const firstname = msg.from.first_name
    const lastname = msg.from.last_name
    const text = msg.text ? msg.text : '';
    const messageId = msg.message_id;

    console.log("msg: ", msg)
    //console.log("text: ", text)

    try {
        // команда Старт
        if (text === '/start') {
            //добавить пользователя в бд
            const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
            if (!user) {
                await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId })
                console.log('Пользователь добавлен в БД')
            } else {
                console.log('Отмена добавления в БД. Пользователь уже существует')
            }
        
            await bot.sendMessage(chatId, 'Добро пожаловать в телеграм-бот U.L.E.Y_Workhub.', {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                        [{text: 'Зарегистрироваться в U.L.E.Y', web_app: {url: webAppUrl}}],
                    ]
                })
            })
        }

        //обработка сообщений    
        if ((text || '')[0] !== '/' && text) {       
            if (text.startsWith('Специалист успешно добавлен')) {           
                //const response = await bot.sendMessage(chatGiaId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

                console.log("Отправляю сообщение в админ-панель...")    
                
                //отправить сообщение о создании проекта в админ-панель
                const convId = sendMyMessage(text, "text", chatId, messageId)
                
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)
                  
                 //отправить сообщение в админку
                socket.emit("sendMessageSpec", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                })
 
 
                 //массив специалистов
                 let specArr = []
                 console.log("Worklist: ", Worklist)
                 if (Worklist !== '') {
                     specArr = Worklist.map(item => ({
                         spec: item.spec,
                         cat: item.cat,
                     }));
                 }

                 console.log("specArr: ", specArr)
 
 
                 try {
                     //создание проекта в БД
                     const res = await Worker.create({
                        userfamily: workerFam, 
                        username: workerName2, 
                        spec: JSON.stringify(specArr),
                        phone: phone2, 
                        dateborn: dateBorn,
                        city: city2, 
                        stag: stag2, 
                        companys: companys2,
                        chatId: chatId
                     })
 
                     console.log('Специалист успешно добавлен в БД! Worker: ' + res.name)

                    } catch (error) {
                        console.log(error.message)
                    }

            } else {
//----------------------------------------------------------------------------------------------------------------
                //отправка сообщения    

                //добавление пользователя в БД
                const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId })
                    console.log('Пользователь добавлен в БД')
                } else {
                    console.log('Отмена операции! Пользователь уже существует')
                }

                // сохранить отправленное боту сообщение пользователя в БД
                const convId = sendMyMessage(text, 'text', chatId, messageId)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);

                socket.emit("addUser", chatId)

                socket.emit("sendMessageSpec", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                })


                // ответ бота
                await bot.sendMessage(chatId, 'Я принял ваш запрос!')
                //await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)           
            }
        }

    } catch (error) {
        console.log('Произошла непредвиденная ошибка! ', error.message)
    }
    
  });


//-------------------------------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8001;

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        
        httpsServer.listen(PORT, () => {
            console.log('HTTPS Server BotWorker running on port ' + PORT);
        });

    } catch (error) {
        console.log('Ошибка!', error.message)
    }
}

start()