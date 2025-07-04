require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_API_TOKEN
// const bot = new TelegramBot(token, {
//     polling: true  
// })
const bot = new TelegramBot(token, {
    polling: {
        autoStart: false,
    }
});

// web-приложение
const webAppUrl = process.env.WEB_APP_URL + '/profile';
const botApiUrl = process.env.REACT_APP_API_URL
const webAppUrlPas = process.env.WEB_APP_URL + '/add-passport';

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

//fetch api
const fetch = require('node-fetch');

const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const $host_bd = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL
})

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
const chatTelegramId = process.env.CHAT_ID
const host_server = process.env.HOST_SERVER
const host = process.env.HOST
const webAppCalendarUrl = process.env.WEB_APP_CALENDAR_URL;

const { Op } = require('sequelize')

let workerId, workerFam, workerName2, phone2, dateBorn, Worklist, city2, stag2, companys2, friend2;
let count = []
let count2 = []
let socket = io(socketUrl);

let currentProcess = 0 
let dataProcess = true
let dataInterval = '0'
let dataTime = 'S'

//functions
const getBlocksP = require('./botworker/common/getBlocksP')
const addPretendent = require('./botworker/common/addPretendent')
const addPretendentAlt = require('./botworker/common/addPretendentAlt')
const sendMyMessage = require('./botworker/common/sendMyMessage')
const getWorkerPretendent = require('./botworker/common/getWorkerPretendent')
const updatePretendent = require("./botworker/common/updatePretendent");
const updatePretendent2 = require("./botworker/common/updatePretendent2");
const getBlocks = require('./botworker/common/getBlocks')
const getDatabaseId = require('./botworker/common/getDatabaseId')

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
const router = require('./botworker/routes/index')
const path = require('path')
const multer  = require("multer")
const sharp = require('sharp');
const pm2 = require('pm2');
const statusMonitor = require('express-status-monitor');

//подключение к БД PostreSQL
const sequelize = require('./botworker/connections/db')
const {UserBot, Message, Conversation, Worker, Pretendent, 
    Projectcash, Smetacash, Canceled, ProjectNew, Specialist} = require('./botworker/models/models');
const addWorker = require("./botworker/common/addWorker");
const addPassport = require("./botworker/common/addPassport");
const addImage = require("./botworker/common/addImage");
const updateWorker = require("./botworker/common/updateWorker");
//const getProjects = require("./botworker/common/getProjects");
const getProjectsAll = require("./botworker/http/getProjectsAll");
const getSmetaAll = require("./botworker/http/getSmetaAll");
const getStavka = require("./botworker/http/stavkaAPI");
const getWorkersAll= require("./botworker/http/getWorkersAll");
const getUserbotsAll = require("./botworker/http/getUserbotsAll");
const getSpecialistAll= require("./botworker/http/getSpecialistAll");


app.use(statusMonitor({
    title: 'Бот специалистов',
    theme: '../../../../../custom.css',
})); // Enable Express Status Monitor middleware
app.use(express.json());
app.use(cors());
app.use(express.static('tg-worker-bot'));
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', router);


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

const {specData} = require('./botworker/data/specData');
const {specNotion} = require('./botworker/data/specNotion');
const getWorkerChildren = require("./botworker/common/getWorkerChildren");
const getWorkerChatId = require("./botworker/common/getWorkerChatId");
const updatePretendentAlt = require("./botworker/common/updatePretendentAlt");
const getProjectName = require("./botworker/common/getProjectName");
const sendMessageAdmin = require("./botworker/common/sendMessageAdmin");
const addAvatar = require("./botworker/common/addAvatar");
const getProjectNew = require("./botworker/common/getProjectNew");
const getOtkaz = require("./botworker/common/getOtkaz");
const getOtkazTest = require("./botworker/common/getOtkazTest");


function unDuplicateArraySingleValues(array) {
    // Проверка, что это не пустой массив
    if ((Array.isArray(array) || array instanceof Array) && array.length) {
      // Возвращает массив уникальных значений
      return [...new Set(array)];
    } else {
      // Это не заполненный массив,
      // возвращаем переданное без изменений
      return array;
    }
  }
  
  function unDuplicateArrayObjects(array, propertyName) {
    if ((Array.isArray(array) || array instanceof Array)
      && array.length
      && typeof propertyName === 'string'
      && propertyName.length) {
      // Массив значений из ключа propertyName, который надо проверить
      const objectValuesArrayFromKey = array.map(item => item[propertyName]);
  
      // Удалить дубли этих значений с помощью предыдущей функции
      const uniqueValues = unDuplicateArraySingleValues(objectValuesArrayFromKey);
  
      // Вернуть массив только с уникальными объектами
      return uniqueValues.map(
        key => array.find(
          item => item[propertyName] === key
        )
      );
    } else {
      return array;
    }
  }

//--------------------------------------------------------------------------------------------------------
//              REQUEST
//--------------------------------------------------------------------------------------------------------

//создание специалиста
app.post('/web-data', async (req, res) => {
    const {queryId, workerfamily, workerName, phone, worklist, 
        city, dateborn, friend} = req.body;
    //const d = new Date(dateborn);
    //const year = d.getFullYear();
    //const month = String(d.getMonth()+1).padStart(2, "0");
    //const day = String(d.getDate()).padStart(2, "0");

    try {

        if (worklist.length > 0) {

            console.log("Начинаю сохранять данные по заявке...")
            workerFam = workerfamily
            workerName2 = workerName
            phone2 = phone
            dateBorn = dateborn
            city2 = city
            // stag2 = stag
            // companys2 = companys
            friend2 = friend
            Worklist = worklist 
            console.log("Сохранение данных завершено: ", workerFam, workerName2, phone2, dateBorn, city2, Worklist)
            
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Данные успешно добавлены',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Данные успешно добавлены!
  
<b>Имя:</b> ${workerName} 
<b>Год рождения:</b> ${dateborn}
<b>Город:</b> ${city} 
<b>Promo ID:</b> ${friend} 
  
<b>Специальности:</b> 
${worklist.map(item =>' - ' + item.spec).join('\n')}`
            }
            })

        }
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

//добавление специальности
app.post('/web-addspec', async (req, res) => {
    const {queryId, worklist, user} = req.body;

    try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Специальность успешно добавлена',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Специальность успешно добавлена!

<b>Специальности:</b> 
${worklist.map(item =>' - ' + item.spec).join('\n')}`
            }
            })

            //console.log("Начинаю сохранять данные в ноушене...", user?.id)

            //сохраниь в бд ноушен
            const specObj = await Specialist.findOne({where:{chatId: user?.id.toString()}}) //await getWorkerNotion(user?.id)
            //console.log("спец: ", specObj)

            setTimeout(async()=> {
                let arrSpec =[]
                const oldlist = JSON.parse(specObj.dataValues.specialization)

                arrSpec = [...oldlist]
                //массив специалистов
                worklist.map(item => {
                    const obj = {
                        spec: item.spec,
                        cat: item.cat,
                    }
                    arrSpec.push(obj)
                })
                console.log("arrSpec: ", arrSpec)

                let newlist = unDuplicateArrayObjects(arrSpec, 'spec')
                console.log("newlist: ", newlist)

                const res2 = await Specialist.update({ 
                    specialization: JSON.stringify(newlist)  
                },
                { 
                    where: {id: specObj.dataValues.id} 
                })           

            }, 2000)
 

        return res.status(200).json({});
    } catch (e) {
        console.log("Ошибка сохранения специальности: ", e.message)
        return res.status(500).json({})
    }
})


//добавление паспорта
app.post('/web-passport', async (req, res) => {
    const {queryId, pasFam, pasName, pasSoname, pasDateborn, pasNumber, pasDate, pasKem, pasKod, pasPlaceborn, 
        pasAdress, pasEmail, user, image} = req.body;
    //const d = new Date(dateborn);
    //const year = d.getFullYear();
    //const month = String(d.getMonth()+1).padStart(2, "0");
    //const day = String(d.getDate()).padStart(2, "0");

    try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Твои данные добавлены',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Твои данные добавлены!
  
<b>${pasFam} ${pasName} ${pasSoname} </b>  

<b>Дата рождения:</b> ${pasDateborn}
<b>Серия и номер:</b> ${pasNumber.split(' ')[0]} ${pasNumber.split(' ')[1]}
<b>Дата выдачи:</b> ${pasDate} 
<b>Кем выдан:</b> ${pasKem}
<b>Код подразделения:</b> ${pasKod}
<b>Место рождения:</b> ${pasPlaceborn}
<b>Адрес регистрации:</b> ${pasAdress}
<b>Email:</b> ${pasEmail}
<b>Аватар:</b> ${image}
` 
            }})

            console.log("Картинка: ", image)
  
            const pass_str = `${pasFam} ${pasName} ${pasSoname} 
                            
Паспорт: ${pasNumber.split(' ')[0]} ${pasNumber.split(' ')[1]}
Дата рождения: ${pasDateborn}
Выдан: ${pasKem} 
Дата выдачи: ${pasDate}   
Код подразделения: ${pasKod}
                            
Место рождения: ${pasPlaceborn}
                            
Адрес регистрации: ${pasAdress}` 

            const worker = await getWorkerChatId(user?.id)
            console.log("passport: ", worker.passport)

            //сохраниь в бд ноушен
            if (!worker.passport) {
                console.log("Начинаю сохранять паспорт...", user?.id)
                const res_pas = await addPassport(pass_str, worker?.id, pasFam, pasName, pasSoname, pasNumber, pasDateborn, pasKem, pasDate, pasKod, pasPlaceborn, pasAdress)
                console.log("add_pas: ", res_pas)
            
                const res_img = await addImage(image, worker?.id)
                console.log("add_image: ", res_img)
            } else {
                console.log("Паспорт уже существует!")
            }    

        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})


//альтернативна ставка
app.post('/web-stavka', async (req, res) => {
    const {queryId, summaStavki, id, userId} = req.body;

    try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Твоя ставка отправлена',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Твоя ставка отправлена!`}})

            console.log("Начинаю сохранять данные в ноушене...", id)
            console.log("chatId: ", userId)

            //специалист
            const workerId = await getWorkerChatId(userId)
            console.log("workerId: ", workerId)
            
            //новый претендент
            const pretendent = {
                projectId: id, 
                workerId: workerId, 
                receiverId: userId,  
                accept: false, 
                otclick: 1   
            }

            //сохраниь в бд ноушен

            const user = await Pretendent.findOne({
                where: {
                    projectId: id,
                    workerId: workerId,
                },
            })
            console.log("ID: ", user)
    
            if (!user) {
                const res = await Pretendent.create(pretendent)
                console.log("Претендент в БД: ", res.dataValues.id)
            } else {
                console.log('Претендент уже создан в БД для этого проекта!') 
                if (user.dataValues.accept) {            
                    const res = await Pretendent.update({            
                        accept:  false,
                        otclick:  1
                    },
                    {
                        where: {
                            projectId: id,
                            workerId: workerId,
                        },
                    })
                //или было нажато принять
                } else {
                    //const count = user.dataValues.otclick + 1
    
                    // const res = await Pretendent.update({ 
                    //     otclick: count  
                    // },
                    // {
                    //     where: {
                    //         projectId: id,
                    //         workerId: workerId,
                    //     },
                    // })
                }
            }


            // const exist2 = await Pretendent.findOne({
            //     where: {
            //         projectId: id,
            //         workerId: workerId,
            //     },
            // })

            //if ((exist2.dataValues.otclick < 2) || ( Math.abs(new Date(exist2.dataValues.updatedAt).getTime()-new Date().getTime()) )>3600000) {
                //ноушен
                const blockId = await getBlocksP(id); 
                console.log("Ставка: ", blockId)   

                // текущая дата
                const date = Date.now() + 10800000; //+3 часа
                const dateNow =new Date(date)
                //console.log("dateNow: ", dateNow)

                //Добавить специалиста в таблицу Претенденты (Ноушен)
                //найти претендента в ноушене
                if (blockId) {
                    const worker = await getWorkerPretendent(blockId, workerId, "")
                    console.log("worker: ", worker)
                        
                    //обновить специалиста в таблице Претенденты если есть
                    if (worker.length > 0) {
                        await updatePretendentAlt(blockId, worker[0].id, summaStavki, dateNow);
                        console.log("Специалист уже есть в таблице Претенденты!") 
                    } else {                 
                        //Добавить специалиста в таблицу Претенденты со своей  ставкой
                        await addPretendentAlt(blockId, workerId, summaStavki, dateNow);
                    } 
                }
            //}

            //отправить сообщение в админ-панель
            //const convId = await sendMyMessage('Вы ' + exist2.dataValues.otclick + '-й раз откликнулись на заявку', "text", chatId, null, null, false)

            // Подключаемся к серверу socket
            // let socket = io(socketUrl);
            // socket.emit("addUser", chatId)
            // socket.emit("sendMessageSpec", {
            //     senderId: chatId,
            //     receiverId: chatTelegramId,
            //     text: 'Вы ' + exist2.dataValues.otclick + '-й раз откликнулись на заявку',
            //     convId: convId,
            //     messageId: null,
            //     isBot: false,
            // }) 

            //return bot.sendMessage(chatId, 'Вы ' + exist2.dataValues.otclick + '-й раз откликнулись на заявку') 
            
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})


bot.getUpdates().then((updates) => {
    if (updates[0] !== undefined) {
      if (updates[0].message.text.includes('/restart')) {
        bot.getUpdates({
          timeout: 1,
          limit: 0,
          offset: updates[0].update_id + 1
        });
        bot.sendMessage(updates[0].message.chat.id, 'Бот перезагружен');
      }
    }
});
bot.stopPolling();
bot.startPolling();


function errorTelegram(error) {
    bot.stopPolling();
    bot.getUpdates({
      timeout: 1,
      limit: 0,
      offset: bot._polling.options.params.offset
    });
    console.error(error);
    pm2.disconnect();
}

//-----------------------------------------------------------------------------------------
// START (обработка команд и входящих сообщени от пользователя)
//-----------------------------------------------------------------------------------------

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const firstname = msg.from.first_name
    const lastname = msg.from.last_name
    const username = msg.from.username
    const text = msg.text ? msg.text : '';
    const messageId = msg.message_id;

    //console.log("msg: ", msg)
    //console.log("text: ", text)

    try {
        // команда Старт
        if (text === '/start') {
            //добавить пользователя в бд
            const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
            if (!user) {
                await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId, username: username })
                console.log('Пользователь добавлен в БД')
            } else {
                console.log('Отмена добавления в БД. Пользователь уже существует')
            }

            //поиск пользователя в notion
            //const res = await getWorkerNotion(chatId)


            //создание чата специалиста
            try {
                let conversation_id

                //найти беседу
                const conversation = await Conversation.findOne({
                    where: {
                        members: {
                            [Op.contains]: [chatId]
                        }
                    },
                })   

                //если нет беседы, то создать 
                if (!conversation) {
                    const conv = await Conversation.create(
                    {
                        members: [chatId, chatTelegramId],
                    })
                    console.log("Беседа успешно создана: ", conv) 
                    console.log("conversationId: ", conv.id)
                    
                    conversation_id = conv.id
                } else {
                    console.log('Беседа уже создана в БД')  
                    console.log("conversationId: ", conversation.id)  
                    
                    conversation_id = conversation.id
                }

                const messageDB = await Message.create(
                {
                    text: 'Пользователь нажал кнопку "Старт"', 
                    senderId: chatId, 
                    receiverId: chatTelegramId,
                    type: 'text',
                    conversationId: conversation_id,
                    isBot: true,
                    messageId: '',
                    replyId: '',
                })

            } catch (error) {
                console.log(error.message)
            }

            //Привет!
            await bot.sendPhoto(chatId, 'https://proj.uley.team/upload/2024-04-02T06:20:12.952Z.jpg', {
                    reply_markup: ({
                        inline_keyboard:[
                            [{text: 'Поехали!', web_app: {url: webAppUrl}}],
                        ]
                    })
            })
            // сохранить отправленное боту сообщение пользователя в БД
            const convId = await sendMyMessage('https://proj.uley.team/upload/2024-04-02T06:20:12.952Z.jpg', 'image', chatId, null)

            // Подключаемся к серверу socket
            let socket = io(socketUrl);
            socket.emit("addUser", chatId)

            socket.emit("sendMessageSpec", {
                senderId: chatTelegramId,
                receiverId: chatId,
                text: 'https://proj.uley.team/upload/2024-04-02T06:20:12.952Z.jpg',
                type: 'image',
                convId: convId,
                isBot: true,
            })

            //-------------------------------------------------------------------------------------------------------------------------

            //Следи за балансом
            setTimeout(async()=> {
                const res = await bot.sendPhoto(chatId, 'https://proj.uley.team/upload/2024-04-02T06:21:42.921Z.jpg')  
                //console.log("res5: ", res)
                
                // сохранить отправленное боту сообщение пользователя в БД
                const convId = await sendMyMessage('https://proj.uley.team/upload/2024-04-02T06:21:42.921Z.jpg', 'image', chatId, null)

                socket.emit("sendMessageSpec", {
                    senderId: chatTelegramId,
                    receiverId: chatId,
                    text: 'https://proj.uley.team/upload/2024-04-02T06:21:42.921Z.jpg',
                    type: 'image',
                    convId: convId,
                    isBot: true,
                })
            }, 300000) // 5 минут

            //регистрация как Неизвестный специалист после отсутствия в бд
            setTimeout(async()=> {
                const user = await Specialist.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await Specialist.create({ 
                        fio: 'Неизвестный специалист',                   
                        specialization: JSON.stringify([{
                            spec: 'Вне категории',
                            cat: 'NoTag'
                        }]),
                        chatId: chatId,
                    })
                    console.log('Пользователь добавлен в БД')
                } else {
                        console.log('Отмена добавления в БД. Пользователь уже существует')
                }
            }, 1800000) // 60 минут | 36000000 (10 часов)
        }
//-----------------------------------------------------------------------------------------------
        if (text === '/sendpic') {
            try {
                const workers = await getWorkersAll() 
                console.log("workers: ", workers.length)
                workers.map(async(item, i)=> {
                    console.log(item.chatId)
                    setTimeout(async()=> {
                        if (JSON.parse(item.worklist).find(it=>it.cat === 'NoTag')){
                            const res = await bot.sendPhoto(item.chatId, 'https://proj.uley.team/upload/2024-02-08T15:00:05.841Z.jpg')
                            if (res) {
                                console.log("Успешно отправлено!", i, item.chatId) 
                            } else {
                                console.log("Ошибка отправки!", i, item.chatId)   
                            }
                        }                     
                    }, 10000 * ++i)
                })

            } catch (error) {
                console.log(error.message)
            }
        }

//-----------------------------------------------------------------------------------------------
        //добавить чат
        if (text === '/addchat') {
            const chatId = 84571366
             //создание чата специалиста
             try {
                let conversation_id

                //найти беседу
                const conversation = await Conversation.findOne({
                    where: {
                        members: {
                            [Op.contains]: [chatId]
                        }
                    },
                })   

                //если нет беседы, то создать 
                if (!conversation) {
                    const conv = await Conversation.create(
                    {
                        members: [chatId, chatTelegramId],
                    })
                    console.log("Беседа успешно создана: ", conv) 
                    console.log("conversationId: ", conv.id)
                    
                    conversation_id = conv.id
                } else {
                    console.log('Беседа уже создана в БД')  
                    console.log("conversationId: ", conversation.id)  
                    
                    conversation_id = conversation.id
                }

                const messageDB = await Message.create(
                {
                    text: 'Пользователь нажал кнопку "Старт"', 
                    senderId: chatId, 
                    receiverId: chatTelegramId,
                    type: 'text',
                    conversationId: conversation_id,
                    isBot: true,
                    messageId: '',
                    replyId: '',
                })

            } catch (error) {
                console.log(error.message)
            }
        }
//------------------------------------------------------------------------------------------------
        //удалить из таблицы wuserbots пользователей таблицы userbots
        if (text === '/cleartable') {
            try {
                let count = 0
                //const workers = await getWorkersAll()
                //const wuserbots = await getUserbotsAll() 

                //найти беседу
                const conversation = await Conversation.findAll() 

                //console.log("conversation size: ", conversation.)

                conversation.map(async(user, index)=> {
                    //console.log(user.dataValues.members)
                    setTimeout(async()=>{
                        const url_send_msg = `https://api.telegram.org/bot${token}/getChat?chat_id=${user.dataValues.members[0]}`
                        const res = await fetch(url_send_msg)
                        //console.log(user.chatId, res?.status)
                        if (res?.status === 400) {
                           count++
                           //console.log("count: ", index, user.dataValues.members[0], res?.status, count)

                            const res = await Conversation.destroy({
                                where: {
                                    members: {
                                        [Op.contains]: [user.dataValues.members[0]]
                                    }
                                },
                            });
                            console.log(res)
                        }
                    }, 100 * ++index)                  
                })
                
            } catch (error) {
                console.log(error.message)
            } 
        }
//------------------------------------------------------------------------------------------------
        //добавить в таблицу workers пользователей из wuserbots
        if (text === '/addworkers') {
            try {
                let count = 0
                const wuserbots = await getUserbotsAll() 
                console.log("wuserbots size: ", wuserbots.length)

                wuserbots.map(async(item, index)=> {
                    //добавить пользователя в бд
                    setTimeout(async()=>{
                        const user = await Worker.findOne({where:{chatId: item.chatId.toString()}})
                        if (!user) {
                            //count++
                            //await Worker.create({ userfamily: item.lastname, username: item.firstname, chatId: item.chatId, username: item.username })
                            await Worker.create({ 
                                userfamily: 'Неизвестный', 
                                username: 'специалист',  
                                phone: '', 
                                dateborn: '',
                                city: '', 
                                companys: '',
                                stag: '',                      
                                worklist: JSON.stringify([{
                                    spec: 'Вне категории',
                                    cat: 'NoTag'
                                }]),
                                chatId: item.chatId.toString(),
                                promoId: '',
                                from: ''
                            })
                            console.log('Пользователь добавлен в БД Workers ', item.chatId, count)
                        } else {
                            //if (item.lastname === 'Неизвестный') {
                                //console.log('Отмена добавления в БД. Пользователь уже существует')
                            // } else {
                            //     //обновить бд
                            //     const res2 = await Worker.update({ 
                            //         userfamily: item.lastname,
                            //         username: item.firstname,
                            //     },
                            //     { 
                            //         where: {chatId: item.chatId} 
                            //     })
                            // }
                            
                        }
                    }, 100 * ++index)
                })
            } catch (error) {
                console.log(error.message)
            }
        }
//-------------------------------------------------------------------------------------------------
        //обновить список специальностей я и Белов
        if (text === '/updateme') {
            let specArr = []
            try {
                console.log("START GET WORKERS ALL...")
                const workers = await getWorkersAll()
                console.log("workers: ", workers.length)  

                workers.map(async(worker, i)=> {
                    let specArr = []
                    //if (worker.chatId === '1408579113' || worker.chatId === '805436270') {
                        //получить данные специалиста по его id
                        const notion = await getWorkerNotion(worker.chatId)
                        // console.log(JSON.stringify(notion))

                        if (notion.length > 0) {
                            //список специалистов
                            notion[0].spec.map((item) => {
                                specData.map((category)=> {
                                    category.models.map((work)=> {
                                        if (work.name === item.name){
                                            const obj = {
                                                spec: item.name,
                                                cat: category.icon,
                                            }
                                            specArr.push(obj)
                                        }
                                    })
                                    if (category.icon === item.name) {
                                        const obj = {
                                            spec: item.name,
                                            cat: category.icon,
                                        }
                                        specArr.push(obj) 
                                    }
                                })

                                if (item.name === 'Blacklist') {
                                    const obj = {
                                        spec: item.name,
                                        cat: 'Blacklist',
                                    }
                                    specArr.push(obj) 
                                }

                                if (item.name === '+18') {
                                    const obj = {
                                        spec: item.name,
                                        cat: '+18',
                                    }
                                    specArr.push(obj) 
                                }
                            })
        
                                //обновить бд
                                
                                    const newSpec = {
                                        spec: 'Вне категории',
                                        cat: 'NoTag'
                                    }
                                    const newSpec2 = {
                                        spec: 'Тест',
                                        cat: 'Test'
                                    }
                                    specArr.push(newSpec)
                                    specArr.push(newSpec2)

                                    const res = await Worker.update({ 
                                        worklist: JSON.stringify(specArr)  
                                    },
                                    { 
                                        where: {chatId: worker.chatId} 
                                    })                              
                            
                        } else {
                            console.log("Специалист не найден в Notion!", worker.chatId, i) 
                        }  
                        
                        console.log(worker.chatId)

                    //} 
                }) 
            } catch (error) {
                console.log(error.message)
            }
        }
//-------------------------------------------------------------------------------------------------
        //отправить расслку неизвестным специалистам
        if (text === '/sendDistrib') {
            const res = await bot.sendMessage(chatId, 'Мы свяжемся с вами в ближайшее время.')
            console.log("res send: ", res)
        }
//-------------------------------------------------------------------------------------------------
        //обновить аватара специалиста
        if (text.startsWith('/updatespecA')) {
            const workerId = text.split(' ');
            //console.log(workerId[1])
            const ID = workerId[1]

            try {
                const workers = await getWorkersAll() 
                //console.log(JSON.stringify(res0))

            } catch (error) {
                console.log(error.message)
            }
        }
//---------------------------------------------------------------------------------------
        if (text === '/restart') {
            let proc = 'botworker';
            pm2.restart(proc, function(err, pr) {
                if (err) {
                    errorTelegram(err);
                }

                bot.sendMessage(chatId, `Process <i>${proc.name}</i> has been restarted`, {
                    parse_mode: 'html'
                });

            });
        }

        //update worker from notion
        if (text === '/profile') {

            // const directory = "/var/www/proj.uley.team/avatars";
            // //очистить директорию
            // fs.readdir(directory, (err, files) => {
            // if (err) throw err;

            // console.log("Начинаю удаление аватарок...")
            // for (const file of files) {
            //     fs.unlink(path.join(directory, file), (err) => {
            //     if (err) throw err;
            //     });
            // }
            // });

            try {
                console.log("START GET WORKERS ALL...")
                const workers = await getWorkersAll()
                console.log("workers: ", workers.length)  

                // 1
                // console.log("START UPDATE WORKERS")
                
                // 2
                console.log("START UPDATE AVATAR")
                workers.map(async(worker, i)=> {
                    let specArr = []
                    setTimeout(async()=> {  
                        //получить данные специалиста по его id
                        const notion = await getWorkerNotion(worker.chatId)
                        //console.log(JSON.stringify(notion))

                        if (notion && notion.length > 0) {
                            
                            //получить аватарку
                            const spec = await getWorkerChildren(notion[0]?.id) 
                            if (spec.length > 0) {
                                console.log("avatar: ", spec[0].image, worker.id) 
    
                                const date = new Date()
                                const currentDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}T${date.getHours()}:${date.getMinutes()}`

                                    try {
                                        //сохранить фото на сервере
                                        if (spec[0].image) {  
                                            const file = fs.createWriteStream('/var/www/proj.uley.team/avatars/avatar_' + worker.chatId + '_' + currentDate + '.jpg');
                                            
                                            const transformer = sharp()
                                            .resize(500)
                                            .on('info', ({ height }) => {
                                                console.log(`Image height is ${height}`);
                                            });
                                            
                                            const request = https.get(spec[0].image, function(response) {
                                                response.pipe(transformer).pipe(file);
                        
                                                // after download completed close filestream
                                                file.on("finish", async() => {
                                                    file.close();
                                                    console.log("Download Completed");

                                                    const url = `${host}/avatars/avatar_` + worker.chatId + '_' + currentDate + '.jpg'
                        
                                                    //обновить бд
                                                    const res = await Worker.update({ 
                                                        avatar: url,
                                                    },
                                                    { 
                                                        where: {chatId: worker.chatId} 
                                                    })
                        
                                                    if (res) {
                                                        console.log("Специалиста аватар обновлен! ", i, url) 
                                                    }else {
                                                        console.log("Ошибка обновления! ", worker.chatId) 
                                                    }
                                                });
                                            });
                                        } else {
                                            console.log("Аватар не читается! ", worker.chatId, i) 
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                            } else {
                                console.log("Аватар не найден в Notion!", worker.chatId, i) 
                            }   
                            
                        } else {
                            console.log("Специалист не найден в Notion!", worker.chatId, i) 
                        }              

                    }, 6000 * ++i) //1206000 * ++i)   
                })     
            } catch (error) {
                console.log(error.message)
            }
        }

        if (text.startsWith('/myavatar')) {
            const workerId = text.split(' ');
            //console.log(workerId[1])
            const ID = workerId[1]
            //let specArr = []
                                     
            //получить данные специалиста по его id
            const notion = await getWorkerNotion(ID)
            //console.log(notion)

            if (notion && notion.length > 0) {
                
                //получить аватарку
                //const spec = await getWorkerChildren(notion[0]?.id) 
                const avatar = notion[0].profile.files.length > 0 ? (notion[0].profile?.files[0].file ? notion[0].profile?.files[0].file.url : notion[0].profile?.files[0].external.url) : null
                console.log("avatar: ", avatar)
                if (avatar) {
                    const date = new Date()
                    const currentDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}T${date.getHours()}:${date.getMinutes()}`
                    const directory = "/var/www/proj.uley.team/avatars";

                    try {
                        //найти старое фото
                        var fileName = ID; 
                        fs.readdir(directory, function(err,list){
                            if(err) throw err;
                            for(var i=0; i<list.length; i++)
                            {
                                if(list[i].includes(fileName))
                                {
                                    //удалить найденный файл (синхронно)
                                    fs.unlinkSync(path.join(directory, list[i]), (err) => {
                                        if (err) throw err;
                                        console.log("Файл удален!")
                                    });
                                }
                            }
                        });

                        //сохранить фото на сервере
                        //if (spec[0].image) {  
                            const file = fs.createWriteStream('/var/www/proj.uley.team/avatars/avatar_' + ID + '_' + currentDate + '.jpg');
                            
                            const transformer = sharp()
                            .resize(500)
                            .on('info', ({ height }) => {
                                console.log(`Image height is ${height}`);
                            });
                            
                            const request = https.get(avatar, function(response) {
                                response.pipe(transformer).pipe(file);
        
                                // after download completed close filestream
                                file.on("finish", async() => {
                                    file.close();
                                    console.log("Download Completed");

                                    const url = `${host}/avatars/avatar_` + ID + '_' + currentDate + '.jpg'
        
                                    //обновить бд
                                    const res = await Worker.update({ 
                                        avatar: url,
                                    },
                                    { 
                                        where: {chatId: ID} 
                                    })
        
                                    if (res) {
                                        console.log("Специалиста аватар обновлен! ", url) 
                                    }else {
                                        console.log("Ошибка обновления! ", ID) 
                                    }
                                });
                            });
                        //} else {
                        //    console.log("Аватар не читается! ", ID) 
                        //}
                    } catch (err) {
                        console.error(err, new Date().toLocaleDateString());
                    }
                        
                } else {
                    console.log("Аватар не найден в Notion!", ID) 
                }   
                
            } else {
                console.log("Специалист не найден в Notion!", ID) 
            } 
        }

        if (text === '/updateprof') {

            const directory = "/var/www/proj.uley.team/avatars";
            //очистить директорию
            fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
                });
            }
            });

            try {
                console.log("START GET WORKERS ALL...")
                const workers = await getWorkersAll()
                console.log("workers: ", workers.length)  
                
                // 2
                console.log("START UPDATE AVATAR")
                workers.map(async(worker, i)=> {
                    let specArr = []
                    setTimeout(async()=> {  
                        //получить данные специалиста по его id
                        const notion = await getWorkerNotion(worker.chatId)
                        //console.log(JSON.stringify(notion))

                        if (notion && notion.length > 0) {
                            
                            //получить аватарку
                            const spec = await getWorkerChildren(notion[0]?.id) 
                            if (spec.length > 0) {
                                console.log("avatar: ", spec[0].image, worker.id) 
    
                                const date = new Date()
                                const currentDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}T${date.getHours()}:${date.getMinutes()}`

                                    try {
                                        //сохранить фото на сервере
                                        if (spec[0].image) {  
                                            const file = fs.createWriteStream('/var/www/proj.uley.team/avatars/avatar_' + worker.chatId + '_' + currentDate + '.jpg');
                                            
                                            const transformer = sharp()
                                            .resize(500)
                                            .on('info', ({ height }) => {
                                                console.log(`Image height is ${height}`);
                                            });
                                            
                                            const request = https.get(spec[0].image, function(response) {
                                                response.pipe(transformer).pipe(file);
                        
                                                // after download completed close filestream
                                                file.on("finish", async() => {
                                                    file.close();
                                                    console.log("Download Completed");
                        
                                                    const url = `${host}/avatars/avatar_` + worker.chatId + '_' + currentDate + '.jpg'
                        
                                                    //обновить бд
                                                    const res = await Worker.update({ 
                                                        avatar: url,
                                                    },
                                                    { 
                                                        where: {chatId: worker.chatId} 
                                                    })
                        
                                                    if (res) {
                                                        console.log("Специалиста аватар обновлен! ", i, url) 
                                                    }else {
                                                        console.log("Ошибка обновления! ", worker.chatId) 
                                                    }
                                                });
                                            });
                                        } else {
                                            console.log("Аватар не читается! ", worker.chatId, i) 
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                            } else {
                                console.log("Аватар не найден в Notion!", worker.chatId, i) 
                            }   
                            
                        } else {
                            console.log("Специалист не найден в Notion!", worker.chatId, i) 
                        }              

                    }, 6000 * ++i) //1206000 * ++i)   
                })        
            } catch (error) {
                console.log(error.message)
            }
        }

        if (text === '/updateavatar') {
            //получить данные специалиста по его id
            const notion = await getWorkerNotion(chatId)
            console.log(JSON.stringify(notion))

            if (notion && notion.length > 0) {
                
                //получить аватарку
                const spec = await getWorkerChildren(notion[0]?.id) 
                if (spec.length > 0) {
                    console.log("avatar: ", spec[0].image) 

                    const date = new Date()
                    const currentDate = `${date.setDate()}${date.getMonth()+1}${date.getFullYear()}T${date.getHours()}:${date.getMinutes()}`

                        try {
                            //сохранить фото на сервере
                            if (spec[0].image) {  
                                const file = fs.createWriteStream('/var/www/proj.uley.team/avatars/avatar_' + chatId + '_' + currentDate + '.jpg');
                                
                                const transformer = sharp()
                                .resize(500)
                                .on('info', ({ height }) => {
                                    console.log(`Image height is ${height}`);
                                });
                                
                                const request = https.get(spec[0].image, function(response) {
                                    response.pipe(transformer).pipe(file);
            
                                    // after download completed close filestream
                                    file.on("finish", async() => {
                                        file.close();
                                        console.log("Download Completed");
            
                                        //обновить бд
                                        const res = await Worker.update({ 
                                            avatar: `${host}/avatars/avatar_` + chatId + '_' + currentDate + '.jpg',
                                        },
                                        { 
                                            where: {chatId: chatId} 
                                        })
            
                                        if (res) {
                                            console.log("Специалиста аватар обновлен! ", chatId) 
                                        }else {
                                            console.log("Ошибка обновления! ", chatId) 
                                        }
                                    });
                                });
                            } else {
                                console.log("Аватар не читается! ", chatId) 
                            }
                        } catch (err) {
                            console.error(err);
                        }
                } else {
                    console.log("Аватар не найден в Notion!", chatId) 
                }   
                
            } else {
                console.log("Специалист не найден в Notion!", chatId) 
            }
        }

//------------------------------------------------------------------------------------------------------
        if (text === '/addspec') {
            try {
                const userbots = await getUserbotsAll() 
                //console.log(JSON.stringify(res0))

                userbots.map(async(item)=> {
                    const user = await Worker.findOne({where:{chatId: item.chatId.toString()}})
                    if (!user) {
                        await Worker.create({
                            userfamily: 'Неизвестный', 
                            username: 'специалист',  
                            phone: '', 
                            dateborn: '',
                            city: '', 
                            companys: '',
                            stag: '',                      
                            worklist: JSON.stringify([{}]),
                            chatId: item.chatId,
                            promoId: '',
                            from: '' 
                        })
                        console.log('Пользователь добавлен в БД: ', item.chatId)
                    } else {
                        console.log('Отмена добавления в БД. Пользователь уже существует')
                    }
                })

               } catch (error) {
                   console.log(error.message)
               }
        }
//-----------------------------------------------------------------------------------------
        if (text === '/editspec') {
            const res = await getWorkerNotion(chatId)
          
            const list = res[0].spec
            console.log("Worklist: ", list)

            //массив специалистов
            let specArr = []
            const obj = {
                     name: 'Звукорежиссер',
                 };
            list.push(obj)
            await updateWorker(res[0].id, list)
        }
//----------------------------------------------------------------------------
        if (text === '/getworkers') {
            console.log("START GET WORKERS ALL...")
            const workers = await getWorkersAll()
            //console.log("workers: ", workers)  

            workers.map(async(worker)=> {
                //получить данные специалиста по его id
                const spec = await getWorkerNotion(worker.chatId)
                let specArr = []

                setTimeout(async()=> {  
                    spec[0].spec.map((item) => {
                        specData.map((category)=> {
                            category.models.map((work)=> {
                                if (work.name === item.name){
                                    const obj = {
                                        spec: item.name,
                                        cat: category.icon,
                                    }
                                    specArr.push(obj)
                                }
                            })
                            if (category.icon === item.name) {
                                const obj = {
                                    spec: item.name,
                                    cat: category.icon,
                                }
                                specArr.push(obj) 
                            }
                        })
                    })

                    if (worker.worklist.find(item=> item.cat !== 'NoTag')) {
                        //обновить бд
                        const res = await Worker.update({ 
                            worklist: JSON.stringify(specArr)  
                        },
                        { 
                            where: {chatId: worker.chatId} 
                        })
                    }        

                }, 6000)   
            }) 
        }
//----------------------------------------------------------------------------------------

        if (text === '/saveprojects') {
            console.log("getProjects start...")
            const projects = await getProjectsAll()
            console.log(projects)

            await Projectcash.truncate();

            projects.map(async(project)=> {
                await Projectcash.create({ 
                    id: project.id, 
                    title: project.title, 
                    dateStart: project.date_start, 
                    dateEnd: project.date_end, 
                    tgURLchat: project.tgURL_chat,
                    manager: project.managerId,
                    status: JSON.stringify(project.status), 
                    specs: JSON.stringify(project.specs) 
                })
            })    
        }
//----------------------------------------------------------------------------------------

        if (text === '/savesmets') {
            console.log("getSmets start...")
            const smets = await getSmetaAll()
            //console.log(smets)

            const projects = await getProjectsAll()

            //очистить таблицу
            await Smetacash.truncate();

            let arraySpecs = []
            let predStavka

            smets.map(async(smeta)=> {

                await Smetacash.create({ 
                    id: smeta.id, 
                    projectId: smeta.projectId, 
                    title: smeta.title, 
                    final: smeta.final,
                    dop: JSON.stringify(smeta.dop)  
                })
            })    
        }
//-----------------------------------------------------------------------------------------------
        if (text.startsWith('/delworker')) {
            const workerId = text.split(' ');
            console.log(workerId[1])

            const res = await Worker.destroy({
                where: {
                  chatId: workerId[1]
                },
            });
            console.log(res)
        }
//-----------------------------------------------------------------------------------------------
        if (text.startsWith('/getblockuser')) {
            const workersId = [5007383134,
                807734040,
                1125929878,
                799516999,
                5615615689,
                6578902964,
                402549103,
                991675647,
                5008645670,
                213226741,
                286722842,
                1868958642,
                1937902679,
                1474685886,
                644061409,
                37015889,
                674870519,
                1838703878,
                1953721108,
                409505513,
                800671513,
                802114988,
                1135808687,
                203802063
            ];

            workersId.map(async(item)=> {
                const res = await UserBot.update({ 
                        blockW: true 
                    },
                    {
                        where: {
                            chatId: item
                        },
                    });
                console.log(res)
            })     
        }

        if (text === '/getNotion') {
            //получить данные специалиста по его id
            const notion = await getWorkerNotion('6143011220')
            //console.log(notion)

            //обновить фио
            const res = await Worker.update({ 
                userfamily: notion[0]?.fio.split(" ")[0],
                username: notion[0]?.fio.split(" ")[1],
                phone: notion[0]?.phone && notion[0]?.phone,
                dateborn: notion[0].age?.start.split('-')[0],
                city: notion[0].city && notion[0].city,                    
                from: 'Notion',
                comment: notion[0]?.comment ? notion[0]?.comment : '',
                rank: notion[0]?.rank ? notion[0]?.rank : null,
            },
            { 
                where: {chatId: '6143011220'} 
            })
            if (res) {
               console.log("Специалист обновлен! ", '6143011220') 
            }else {
                console.log("Ошибка обновления! ", '6143011220') 
            }
        }

        if (text.startsWith('/getpretendent')) {

            //специалист
            const worker = await getWorkerChatId(chatId)
            const workerId = worker.dataValues.id.toString()
            console.log("workerId: ", workerId)
            
            //новый претендент
            const pretendent = {
                projectId: '120', 
                workerId: workerId, 
                receiverId: chatId,  
                accept: false, 
                otclick: 1   
            }


            const user = await Pretendent.findOne({
                where: {
                    projectId: '120',
                    workerId: workerId,
                },
            })
            console.log("ID: ", user)

            if (!user) {
                const res = await Pretendent.create(pretendent)
                console.log("Претендент в БД: ", res)
            } else {
                console.log('Претендент уже создан в БД для этого проекта!') 
                const count = user.dataValues.otclick + 1
    
                const res = await Pretendent.update({ 
                    otclick: count  
                },
                {
                    where: {
                        projectId: '120',
                        workerId: workerId,
                    },
                })
            }
        }

        if (text === '/getdelete') {
            console.log("START GET WORKERS ALL...")
            const workers = await getWorkersAll()
            workers.map(async (user, index) => { 
                setTimeout(async()=>{
                    const url_send_msg = `https://api.telegram.org/bot${token}/getChat?chat_id=${user.chatId}`
                    const sendTextToTelegram = await $host_bd.get(url_send_msg);
                    console.log("res: ", sendTextToTelegram.data.ok, index)
                }, 500 * ++index)    
            })
        }

        if (text === '/gethours') {
            const currentHours = new Date(new Date().getTime()+10800000).getHours()
                        console.log("currentHours: ", currentHours)

                        let hello = ''
                        if (currentHours >= 6 && currentHours < 12) {
                            hello = 'Доброе утро'
                        } else if (currentHours >= 12 && currentHours < 18) {
                            hello = 'Добрый день'
                        } else if (currentHours >= 0 && currentHours < 6) {
                            hello = 'Доброй ночи'
                        } else {
                            hello = 'Добрый вечер' //18-0
                        }
                        console.log(hello)
        }

        if (text.startsWith('/otkaz')) {
            const workerId = text.split(' ');
            console.log(workerId[1])
            const projectId = '2b974ded-f14f-4a34-9b6c-80f0bd285fa8'

            //ноушен
            const blockId = await getBlocksP(projectId); 

            if (blockId) {
                const worker = await getWorkerPretendent(blockId, workerId)
                //console.log("worker status: ", i, worker)
                
                //const projectName = await getProjectName(projectId)
                //const user = await Worker.findOne({where:{chatId: chatId.toString()}})
            }
        }

        if (text.startsWith('/startotkaz')) {
            const chatId = text.split(' ');
            console.log(chatId[1])

            const projectId = '2f459e43-2eff-4274-a8aa-cf24ba34520a' //фаза gate

            //специалист ID
            const workerId = await getWorkerChatId(chatId[1])

            //ноушен
            const blockId = await getBlocksP(projectId); 

            if (blockId) {
                const worker = await getWorkerPretendent(blockId, workerId)   
                const projectName = await getProjectName(projectId)
                const user = await Worker.findOne({where:{chatId: chatId[1].toString()}})

                const currentHours = new Date(new Date().getTime()+10800000).getHours()

                //запуск сканирования отказа специалисту
                let hello = ''
                if (currentHours >= 6 && currentHours < 12) {
                    hello = 'Доброе утро'
                } else if (currentHours >= 12 && currentHours < 18) {
                    hello = 'Добрый день'
                } else if (currentHours >= 0 && currentHours < 6) {
                    hello = 'Доброй ночи'
                } else {
                    hello = 'Добрый вечер' //18-0
                }

                //отправить сообщение в админ-панель
                const text = `${hello}, ${user.dataValues.username}! 
    Спасибо, что откликнулись на проект «${projectName.properties?.Name.title[0].plain_text}». В настоящий момент основной состав уже сформирован. 
    Будем рады сотрудничеству на новых проектах!`
        
                const convId = await sendMessageAdmin(text, "text", chatId[1], null, null, false)
                                    
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId[1])
                socket.emit("sendAdminSpec", {
                    senderId: chatTelegramId,
                    receiverId: chatId[1],
                    text: text,
                    convId: convId,
                    messageId: null,
                })  
            
                await bot.sendMessage(chatId[1], text)
            }
        }


        if (text === '/startpretendent') {
            const text = 'Добрый день, для добавления вас в чат проекта необходимо ...'
            console.log(text)

            let keyboard 
            const image = 'https://proj.uley.team/upload/2024-06-12T08:38:45.822Z.jpg'

            const data = [{telegram_id: '805436270', chat_link: 'https://t.me/+GMsB8_3M6eo4NWEy'}, {telegram_id: '6143011220', chat_link: 'https://t.me/+GMsB8_3M6eo4NWEy'}]

            data.map(async(item, i)=> {
                    setTimeout(async() => {
                        keyboard = JSON.stringify({
                            inline_keyboard: [
                                [
                                    {"text": 'Перейти в чат', url: item.chat_link.replace('+','%2b')},
                                ],
                            ]
                        });

                        try {
                            const url_send_msg = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${item.telegram_id}&parse_mode=html&text=${item.chat_link.replace('+','%2b')}`
                            const url_send_photo = `https://api.telegram.org/bot${token}/sendPhoto?chat_id=${item.telegram_id}&photo=${image}&reply_markup=${keyboard}`

                            const sendTextToTelegram = await $host.get(url_send_msg)
                            const sendPhotoToTelegram = await $host.get(url_send_photo)
                            
                        } catch (error) {
                            console.error(error.message)
                        }
                        
                        
                    }, 1000 * ++i)
            })
        }

        if (text === '/projectnew') {
            console.log("START GET PROJECT NEW...")
                //notion
                const projects = await getProjectNew()

                try {    
                    const projectsNew = await ProjectNew.findAll()
                    //console.log("projectsNew: ", projectsNew)

                    //добавление новых проектов
                    projects.map(async(project)=> {
                        const id = project.id
                        let exist = await ProjectNew.findOne( {where: {id}} )
                        
                        if(!exist){
                            await ProjectNew.create({ 
                                id: project.id, 
                                name: project.name, 
                                datestart: project.datestart, 
                                crmID: project.crmID, 
                            })
                            //return;
                        }   else {
                            await ProjectNew.update({name: project.name},{where: {id: project.id}})    
                            console.log("Проект в кеше обновлен!")   
                        } 
                    })

                    //удаление старых проектов
                    projectsNew.map(async(project)=> {
                        const projectOld = projects.find(item => item.id === project.id)
                        //console.log("projectOld: ", projectOld)
                        if (projectOld === undefined) {
                            await ProjectNew.destroy({
                                where: {
                                    id: project.id,
                                }
                            })
                            console.log("Проект удален!")
                        }
                    })

                } catch (error) {
                    //console.log("Ошибка botworker.js 1951")
                    //return error.message;
                    console.error(error.message)
                } 
        }

        if (text === '/sendwork') {
            // Подключаемся к серверу socket
            let socket = io(socketUrl);

            socket.emit("sendWorker", {
                task: 301,
                data: [
                    {
                        telegram_id: 805436270,
                        chat_link: 'https://t.me/+GMsB8_3M6eo4NWEy',
                    },
                    {
                        telegram_id: 6143011220,
                        chat_link: 'https://t.me/+GMsB8_3M6eo4NWEy',
                    },
                ],
            }) 
        }


        if (text === '/testwhile') {
            let j = 2
            while(j) {
                try {   
                    await getOtkazTest(bot)
                } catch (error) {
                    //console.log(error.message)
                    console.error("Ошибка в системе отказов претендентам")
                }
                j--
            }
        }

        //удалить старые записи из таблицы Canceled
        if (text === '/delcancel') {
            const daysAgo5 = new Date(new Date().setDate(new Date().getDate() - 5));
            const res = Canceled.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: daysAgo5
                    }
                }
            })
            console.log(res)
        }

        if (text.startsWith('/getDateOtkaz')) {
            const projectId = text.split(' ');
            console.log("projectId: ", projectId[1])
            let databaseBlock;
            let allDate = [];
            if (projectId[1]) {
                const blockId = await getBlocks(projectId[1]);            
                if (blockId) {
                    j = 0    
                    databaseBlock = await getDatabaseId(blockId);   
                } 

                //получить массив дат
                if (databaseBlock) {   
                    databaseBlock.map((db) => {
                        allDate.push(db?.date)                        
                    })
                }

                //получить уникальные даты из Основного состава по возрастанию
                const dates = [...allDate].filter((el, ind) => ind === allDate.indexOf(el));
                const sortedDates = [...dates].sort((a, b) => {       
                    var dateA = new Date(a), dateB = new Date(b) 
                    return dateA-dateB  //сортировка по возрастающей дате  
                })

                const datesObj = []

                sortedDates.map((item) =>{
                    const obj = {
                        date: item,
                    }
                    datesObj.push(obj)  
                })

                console.log("datesObj: ", datesObj)
                console.log("1: ", datesObj[0])
                console.log("2: ", datesObj[datesObj.length-1])
            }       
        }

        if (text === '/updatecancel') {
            //получить все запуски сканирования отказов
            const currentDate = new Date()
            const otkazi = await Canceled.findAll({
                order: [
                    ['id', 'ASC'],
                ],
                where: {
                    cancel: false,
                }
            })

            //const filterOtkaz = otkazi.filter((item)=> new Date(item.dataValues.datestart) >= currentDate || new Date(item.dataValues.dateend <= currentDate))
            //console.log("filterOtkaz: ", filterOtkaz.length)

            let databaseBlock;
            let allDate = [];

            if (otkazi && otkazi.length > 0) {
                console.log("Отказы ", otkazi.length)

                otkazi.map((item, index)=> {
                    setTimeout(async()=> {
                        const projectId = item.dataValues.projectId
                        const workerId = item.dataValues.workerId
                    
                        if (projectId) {
                        
                            allDate = []
                            const projectName = await getProjectName(projectId)

                            console.log("projectId: ", projectId)
                            console.log("Index: ", index)
                            const blockId = await getBlocks(projectId);            
                            if (blockId) {
                                j = 0    
                                databaseBlock = await getDatabaseId(blockId);   
                            } 
    
                            //получить массив дат
                            if (databaseBlock) {   
                                databaseBlock.map((db) => {
                                    allDate.push(db?.date)                        
                                })
                            }
    
                            //получить уникальные даты из Основного состава по возрастанию
                            const dates = [...allDate].filter((el, ind) => ind === allDate.indexOf(el));
                            const sortedDates = [...dates].sort((a, b) => {       
                                var dateA = new Date(a), dateB = new Date(b) 
                                return dateA-dateB  //сортировка по возрастающей дате  
                            })
    
                            const datesObj = []
    
                            sortedDates.map((item) =>{
                                const obj = {
                                    date: item,
                                    consilience: false,
                                    send: false,
                                }
                                datesObj.push(obj)  
                            })
                            console.log("projectName: ", projectName.properties.Name.title[0].plain_text)
                            console.log("datesObj: ", datesObj)

                            if (datesObj.length > 0) {
                                const res = await Canceled.update(
                                    { 
                                        datestart: datesObj[0].date, 
                                        dateend: datesObj[datesObj.length-1].date 
                                    },
                                    {
                                        where: {
                                            projectId: projectId,
                                            workerId: workerId,
                                        },
                                    }
                                )
                            } else {
                                const res = await Canceled.update(
                                    { 
                                        datestart: null, 
                                        dateend: null 
                                    },
                                    {
                                        where: {
                                            projectId: projectId,
                                            workerId: workerId,
                                        },
                                    }
                                ) 
                            }

                            
                            console.log("Отказ обнавлен! ")
                        }
                       
                    }, 5000 * ++index)
                })
                
            } else {
                console.log("Отказы нет", otkazi)
            }
        }
        
        if (text === '/getdelworker') {
            //получить все запуски сканирования отказов
            const delWorker = await Specialist.update(
                { 
                    deleted: null,
                },
                {
                    where: {
                        deleted: true,
                    },
                }
            )
            console.log("res: ", delWorker)
        }

        if (text === '/delspam') {
            //получить все запуски сканирования отказов
            const specialist = await Specialist.findAll({
                order: [
                    ['id', 'DESC'], //DESC, ASC
                ],
            })
            console.log("specialist: ", specialist.length)

            specialist.map(async(man, index)=> {
                setTimeout(async()=> { 
                    for (let i = 420826; i <= 421650; i++) {
                        console.log("specialist: ", index, i, man.chatId)
                        try {
                            const url_del_msg = `https://api.telegram.org/bot${token}/deleteMessage?chat_id=${man.chatId}&message_id=${i}`
                            const delToTelegram = await $host.get(url_del_msg);

                            //Выводим сообщение об успешном удалении
                            if (delToTelegram) {
                                console.log('Ваше сообщение удалено из телеграм! ', i, man.chatId);	
                                setVisibleDelMess(true) //показать сообщение об отправке
                            }           
                        } catch (err) {
                            console.error(err.message, index, i, man.chatId)
                        }
                        
    
                    }
                    
                }, 10000 * ++index)       
            })
        }


        if (text === '/savespecdb') {

            const workers = specNotion.reverse().map((page) => {
                let specArr = []
                page.properties.Specialization.multi_select.map(item=> {                   
                    //arr.push({spec: item.name})
                    specData.map((category)=> {
                        category.models.map((work)=> {
                            if (work.name === item.name){
                                const obj = {
                                    spec: item.name,
                                    cat: category.icon,
                                }
                                specArr.push(obj)
                            }
                        })
                        if (category.icon === item.name) {
                            const obj = {
                                spec: item.name,
                                cat: category.icon,
                            }
                            specArr.push(obj) 
                        }
                    })  
                    
                    if (item.name === 'Blacklist') {
                        const obj = {
                            spec: item.name,
                            cat: 'Blacklist',
                        }
                        specArr.push(obj) 
                    }

                    if (item.name === '+18') {
                        const obj = {
                            spec: item.name,
                            cat: '+18',
                        }
                        specArr.push(obj) 
                    }

                    if (item.name === 'Менеджер «U.L.E.Y»') {
                        const obj = {
                            spec: item.name,
                            cat: 'Менеджер',
                        }
                        specArr.push(obj) 
                    }
                })

                let skillArr = []
                page.properties.Skill.multi_select.length > 0 && page.properties.Skill.multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    skillArr.push(obj) 
                }) 

                let merchArr = []
                page.properties.Merch.multi_select.length > 0 && page.properties.Merch.multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    merchArr.push(obj) 
                })

                let companyArr = []
                page.properties.Company.multi_select.length > 0 && page.properties.Company.multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    companyArr.push(obj) 
                })

                let comtegArr = []
                page.properties["КомТег"].multi_select.length > 0 && page.properties["КомТег"].multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    comtegArr.push(obj) 
                })

                let comtegArr2 = []
                page.properties["КомТег 2"].multi_select.length > 0 && page.properties["КомТег 2"].multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    comtegArr2.push(obj) 
                })

                let comment = []
                page.properties["Комментарии"].rich_text.length > 0 && page.properties["Комментарии"].rich_text.map(item2=> { 
                    const obj = {
                        content: item2.plain_text,
                    }
                    comment.push(obj) 
                })

                let comment2 = []
                page.properties["Комментарии 2"].rich_text.length > 0 && page.properties["Комментарии 2"].rich_text.map(item2=> { 
                    const obj = {
                        content: item2.plain_text,
                    }
                    comment2.push(obj) 
                })

                return {
                    fio: page.properties.Name.title[0]?.plain_text,
                    chatId: page.properties.Telegram.number,
                    phone: page.properties.Phone.phone_number,
                    phone2: page.properties["Phone 2"].phone_number,
                    specialization: JSON.stringify(specArr),  
                    city: page.properties["Город"].multi_select[0]?.name,
                    skill: JSON.stringify(skillArr), 
                    promoId: page.properties["Промокод ID"].number, 
                    rank: page.properties["Ранг"].number, 
                    merch: JSON.stringify(merchArr), 
                    company: JSON.stringify(companyArr), 
                    comteg: JSON.stringify(comtegArr), 
                    comteg2: JSON.stringify(comtegArr2), 
                    comment: JSON.stringify(comment),
                    comment2: JSON.stringify(comment2),
                    age: page.properties.Age.date?.start,
                    reyting: page.properties["Рейтинг"].rich_text[0]?.plain_text,
                    inn: page.properties["ИНН"].rich_text[0]?.plain_text, 
                    passport: page.properties.Passport.rich_text[0]?.plain_text,
                    profile: page.properties["Профиль"].files.length > 0 ? (page.properties["Профиль"]?.files[0].file ? page.properties["Профиль"]?.files[0].file.url : page.properties["Профиль"]?.files[0].external.url) : null,
                    dogovor: page.properties["Договор"].select?.name ? true : false,
                    samozanjatost: page.properties["Самозанятость"].select?.name ? true : false,
                    passportScan: page.properties["Паспорт скан"]?.files.length > 0 ? (page.properties["Паспорт скан"]?.files[0].file ? page.properties["Паспорт скан"]?.files[0].file.url : page.properties["Паспорт скан"]?.files[0].external.url) : null,
                    email: page.properties.Email.email, 
                };
            });

            console.log("arr_worker: ", workers.length)


            workers.map(async (user, index) => {      
                setTimeout(async()=> { 
                    console.log(index + " Пользовател: " + user.chatId + " сохранен!")

                    //сохранение сообщения в базе данных wmessage
                    await Specialist.create(user)

                }, 500 * ++index) 

            })
                

        }


        if (text === '/newavatar') {
            const oldWorker = await Worker.findAll()
            const newWorker = await Specialist.findAll()
            console.log(oldWorker.length, newWorker.length, oldWorker[0].chatId)

            oldWorker.map((item, i)=> {
                const updWorker = newWorker.find((user)=> user.chatId === item.chatId)

                if (updWorker) {
                    setTimeout(async()=> {
                        if (item.avatar.length > 0) {
                        //   console.log(item.avatar, item.chatId) 
                        //   console.log(updWorker.chatId) 

                            const worker = await Specialist.update(
                                { 
                                    profile: item.avatar,
                                },
                                {
                                    where: {
                                        chatId: item.chatId.toString(),
                                    },
                                }
                            )
                            console.log("res: ", worker) 
                        }
   
                         
                    }, 500 * ++i)
                }

                
            })

            //получить все запуски сканирования отказов
            // const worker = await Specialist.update(
            //     { 
            //         profile: null,
            //     },
            //     {
            //         where: {
            //             chatId: chatId,
            //         },
            //     }
            // )
            // console.log("res: ", worker)
        }

        if (text === '/newdatecreate') {
            const oldWorker = await Worker.findAll()
            const newWorker = await Specialist.findAll()
            console.log(oldWorker.length, newWorker.length, oldWorker[0].chatId)

            oldWorker.map((item, i)=> {
                const updWorker = newWorker.find((user)=> user.chatId === item.chatId)

                if (updWorker) {
                    setTimeout(async()=> {
                            console.log(i) 
                            console.log("Дата создания: ", item.createdAt) 

                            const worker = await Specialist.update(
                                { 
                                    createdAt: item.createdAt,
                                },
                                {
                                    where: {
                                        chatId: item.chatId.toString(),
                                    },
                                }
                            )
                            console.log("res: ", worker) 
                         
                    }, 500 * ++i)
                }               
            })
        }

        if (text === '/copypassport') {

            try {
                console.log("START GET WORKERS ALL...")
                const workers = await getSpecialistAll()
                console.log("workers: ", workers.length)  

                console.log("START UPDATE PASSPORT")
                workers.map(async(worker, i)=> {
                    let specArr = []
                    if (worker.passport) {  
                        let matches = worker.passport.split(' ')[0].match(/\d+/g);
                        //
                        if (matches !== null) {
                            //number
                            //console.log("matches: ", matches)
                            //обновить бд
                            // const res = await Specialist.update({ 
                            //     passeria: worker.passport.split(' ')[0] + worker.passport.split(' ')[1],
                            //     pasnumber: worker.passport.split(' ')[2],
                            // },
                            // { 
                            //     where: {id: worker.id} 
                            // })  
                        }
                        else {
                            //Паспорт
                            // const resStr = worker.passport.split('\n')[2]
                            // if (resStr) {
                            //     if (resStr.includes('Паспорт')) {
                            //         //name
                            //         //обновить бд
                            //         const res = await Specialist.update({ 
                            //             passeria: resStr.split(': ')[1].split(' ')[0],
                            //             pasnumber: resStr.split(': ')[1].split(' ')[1],
                            //         },
                            //         { 
                            //             where: {id: worker.id} 
                            //         })
                                    
                            //         i++
                            //         console.log(i, resStr) 
                            //     }
                                
                            // }
                            //Дата рождения
                            const resStr = worker.passport.split('\n')[3]
                            if (resStr) {
                                if (resStr.includes('Дата рождения')) {
                                    //name
                                    //обновить бд
                                    const res = await Specialist.update({ 
                                        pasdateborn: resStr.split(': ')[1],
                                    },
                                    { 
                                        where: {id: worker.id} 
                                    })
                                    
                                    i++
                                    console.log(i, resStr.split(': ')[1]) 
                                }
                                
                            }
                            //Выдан
                            // const resStr5 = worker.passport.split('\n')[4]
                            // if (resStr5) {
                            //     if (resStr5.includes('Выдан')) {
                            //         //name
                            //         //обновить бд
                            //         const res = await Specialist.update({ 
                            //             paskemvidan: resStr5.split(': ')[1],
                            //         },
                            //         { 
                            //             where: {id: worker.id} 
                            //         })
                                    
                            //         i++
                            //         console.log(i, resStr5) 
                            //     }
                                
                            // }
                            //Дата выдачи
                            // const resStr6 = worker.passport.split('\n')[5]
                            // if (resStr6) {
                            //     if (resStr6.includes('Дата выдачи')) {
                            //         //name
                            //         //обновить бд
                            //         const res = await Specialist.update({ 
                            //             pasdatevidan: resStr6.split(': ')[1],
                            //         },
                            //         { 
                            //             where: {id: worker.id} 
                            //         })
                                    
                            //         i++
                            //         console.log(i, resStr6.split(': ')[1]) 
                            //     }
                                
                            //}
                            //Код подразделения
                            // const resStr7 = worker.passport.split('\n')[6]
                            // if (resStr7) {
                            //     if (resStr7.includes('Код подразделения')) {
                            //         //name
                            //         //обновить бд
                            //         const res = await Specialist.update({ 
                            //             pascode: resStr7.split(': ')[1],
                            //         },
                            //         { 
                            //             where: {id: worker.id} 
                            //         })
                                    
                            //         i++
                            //         console.log(i, resStr7) 
                            //     }
                                
                            // }
                            //Место рождения
                            // const resStr8 = worker.passport.split('\n')[8]
                            // if (resStr8) {
                            //     if (resStr8.includes('Место рождения')) {
                            //         //name
                            //         //обновить бд
                            //         const res = await Specialist.update({ 
                            //             pasbornplace: resStr8.split(': ')[1],
                            //         },
                            //         { 
                            //             where: {id: worker.id} 
                            //         })
                                    
                            //         i++
                            //         console.log(i, resStr8) 
                            //     }
                                
                            // }
                            //Адрес регистрации
                            // const resStr9 = worker.passport.split('\n')[10]
                            // if (resStr9) {
                            //     if (resStr9.includes('Адрес регистрации')) {
                            //         //name
                            //         //обновить бд
                            //         const res = await Specialist.update({ 
                            //             pasaddress: resStr9.split(': ')[1],
                            //         },
                            //         { 
                            //             where: {id: worker.id} 
                            //         })
                                    
                            //         i++
                            //         console.log(i, resStr9) 
                            //     }
                                
                            // }
                        }
                    }  
                })     
            } catch (error) {
                console.log(error.message)
            }
        }

        if (text.startsWith('/calendar')) {
            const userId = text.split(' ');
            console.log(userId[1])

            //Привет!
            await bot.sendMessage(chatId, 'Календарь', {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Поехали!', web_app: {url: webAppCalendarUrl + `/${userId[1]}`}}],
                    ]
                })
            })
        }
//------------------------------------------------------------------------------------------------
//обработка контактов
        if (msg.contact) {
            await bot.sendMessage(chatId, `Ваш контакт получен!`)
            const phone = msg.contact.phone_number
            const firstname = msg.contact.first_name
            const lastname = msg.contact.last_name ? msg.contact.last_name : ''
            
            //const response = await bot.sendContact(chatTelegramId, phone, firstname, lastname, vcard)  
            //const response2 = await bot.sendContact(chatGiaId, phone, firstname, lastname, vcard)   
            const text_contact = `${phone} ${firstname} ${lastname}`

            console.log("Отправляю контакт в админ-панель...")

            //отправить сообщение о контакте в админ-панель
            const convId = await sendMyMessage(text_contact, "text", chatId, messageId, null, false)
                
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)
                 
                //отправить сообщение в админку
                socket.emit("sendMessageSpec", {
                     senderId: chatId,
                     receiverId: chatTelegramId,
                     text: text_contact,
                     type: 'text',
                     convId: convId,
                     messageId: messageId,
                     isBot: false,
                 })
        }
//--------------------------------------------------------------------------------------------------
        //обработка документов
        if (msg.document) {
            console.log(msg.document)
            const docum = await bot.getFile(msg.document.file_id);
            try {
                const res = await fetch(
                    `https://api.telegram.org/bot${token}/getFile?file_id=${docum.file_id}`
                );

                // extract the file path
                const res2 = await res.json();
                const filePath = res2.result.file_path;

                // now that we've "file path" we can generate the download link
                const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;

                https.get(downloadURL,(res) => {
                    const filename = Date.now()
                    // Image will be stored at this path
                    let path;
                    let ras;
                    if(msg.document) {
                        ras = msg.document.mime_type.split('/')
                        //path = `${__dirname}/static/${filename}.${ras[1]}`; 
                        path = `${__dirname}/static/${msg.document.file_name}`.replaceAll(/\s/g, '_'); 
                    }
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', async () => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        let convId;
                        if(msg.document) {
                            // сохранить отправленное боту сообщение пользователя в БД
                            convId = await sendMyMessage(`${botApiUrl}/${msg.document.file_name}`.replaceAll(/\s/g, '_'), 'file', chatId, messageId)
                        }

                        // Подключаемся к серверу socket
                        let socket = io(socketUrl);
                        socket.emit("addUser", chatId)
                        socket.emit("sendMessageSpec", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${msg.document.file_name}`.replaceAll(/\s/g, '_'),
                            convId: convId,
                            isBot: false,
                        })
                    })
                })
            } catch (error) {
                console.log(error.message)
            }
        }
//----------------------------------------------------------------------------------------------------------------          
        //обработка изображений
        if (msg.photo) {
            console.log(msg.photo)
            //console.log(msg.photo.length)
            const image = await bot.getFile(msg.photo[msg.photo.length-1].file_id);

            try {
                const res = await fetch(
                    `https://api.telegram.org/bot${token}/getFile?file_id=${image.file_id}`
                );

                // extract the file path
                const res2 = await res.json();
                const filePath = res2.result.file_path;

                // now that we've "file path" we can generate the download link
                const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;

                https.get(downloadURL,(res) => {
                    const filename = Date.now()
                    // Image will be stored at this path
                    const path = `${__dirname}/static/${filename}.jpg`; 
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', async () => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        // сохранить отправленное боту сообщение пользователя в БД
                        const convId = await sendMyMessage(`${botApiUrl}/${filename}.jpg`, 'image', chatId, messageId)

                        // Подключаемся к серверу socket
                        let socket = io(socketUrl);

                        socket.emit("addUser", chatId)
                        //socket.on("getUsers", users => {
                            //console.log("users from bot: ", users);
                        //})

                        socket.emit("sendMessageSpec", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${filename}.jpg`,
                            type: 'image',
                            convId: convId,
                        })
                    })
                })            
            } catch (error) {
                console.log(error.message)
            }
        }
//---------------------------------------------------------------------------------------------------------------

 //обработка аудио сообщений
        if (msg.voice) {
            await bot.sendMessage(chatId, `Ваше аудио-сообщение получено!`)
            const voice = await bot.getFile(msg.voice.file_id);

            try {
                const res = await fetch(
                    `https://api.telegram.org/bot${token}/getFile?file_id=${voice.file_id}`
                );

                // extract the file path
                const res2 = await res.json();
                const filePath = res2.result.file_path;

                // now that we've "file path" we can generate the download link
                const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;

                https.get(downloadURL,(res) => {
                    const filename = Date.now()
                    // Image will be stored at this path
                    let path;
                    let ras;
                    if(msg.voice) {
                        ras = msg.voice.mime_type.split('/')
                        //path = `${__dirname}/static/${filename}.${ras[1]}`; 
                        path = `${__dirname}/static/${msg.voice.file_unique_id}.${ras[1]}`; 
                    }
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', async () => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        let convId;
                        if(msg.voice) {
                            // сохранить отправленное боту сообщение пользователя в БД
                            convId = await sendMyMessage(`${botApiUrl}/${msg.voice.file_unique_id}.${ras[1]}`, 'file', chatId, messageId)
                        }

                        //Подключаемся к серверу socket
                        let socket = io(socketUrl);
                        socket.emit("addUser", chatId)
                        socket.emit("sendMessageSpec", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${msg.voice.file_unique_id}.${ras[1]}`,
                            convId: convId,
                            isBot: false,
                        })
                    })
                })            
            } catch (error) {
                console.log(error.message)
            }
        }

//----------------------------------------------------------------------------------------------------------------      

        //обработка сообщений    
        if ((text || '')[0] !== '/' && text) {       
            if (text.startsWith("Reply")) {           
                await bot.sendMessage(text.substring(6, text.indexOf('.')), text.slice(text.indexOf('.') + 2)) 

            // Специалист успешно создан
            } else if (text.startsWith('Данные успешно добавлены!')) {           
                const response = await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

                console.log("Отправляю сообщение в админ-панель...")    
                
                //отправить сообщение о добавлении специалиста в бд в админ-панель
                const convId = sendMyMessage(text, "text", chatId, parseInt(response.message_id)-1)
                
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
                    messageId: parseInt(response.message_id)-1,
                })

                //город
                if (city2 === 'москва' || city2 === 'Масква' || city2 === 'масква' || city2 === 'МОСКВА' || 
                    city2 === 'Mockva' || city2 === 'Mocква' || city2 === 'Mosква'|| city2 === 'Mackва' || 
                    city2 === 'Mockba') {
                        city2 = 'Москва'
                }
 
                //массив специалистов
                let specArr = []
                let specArr2 = []
                console.log("Worklist: ", Worklist)
                if (Worklist !== '') {
                    specArr = Worklist.map(item => ({
                        spec: item.spec,
                        cat: item.cat,
                    }));

                    specArr2 = Worklist.map(item => ({
                        name: item.spec,
                    }));
                }


                    const currentMonth = new Date().getMonth() + 1
                    let urlAvatar = ''
                    
                    if (currentMonth === 1) {
                        //апрель
                        urlAvatar = 'https://proj.uley.team/upload/01_2025.jpg'
                    } 
                    else if (currentMonth === 2) {
                        //май
                        urlAvatar = 'https://proj.uley.team/upload/02_2025.jpg'
                    } 
                    else if (currentMonth === 3) {
                        //май
                        urlAvatar = 'https://proj.uley.team/upload/03_2025.jpg'
                    } 
                    else if (currentMonth === 4) {
                        //май
                        urlAvatar = 'https://proj.uley.team/upload/04_2025.jpg'
                    } 
                    else if (currentMonth === 5) {
                        //май
                        urlAvatar = 'https://proj.uley.team/upload/05_2025.jpg'
                    } 
                    else if (currentMonth === 6) {
                        //июнь
                        urlAvatar = 'https://proj.uley.team/upload/06_2025.jpg'
                    }
                    else if (currentMonth === 7) {
                        //июль
                        urlAvatar = 'https://proj.uley.team/upload/07_2025.jpg'
                    }
                    else if (currentMonth === 8) {
                        //август
                        urlAvatar = 'https://proj.uley.team/upload/08_2025.jpg'
                    }
                    else if (currentMonth === 9) {
                        //сентябрь
                        urlAvatar = 'https://proj.uley.team/upload/09_2025.jpg'
                    }
                    else if (currentMonth === 10) {
                        //октябрь
                        urlAvatar = 'https://proj.uley.team/upload/10_2025.jpg'
                    }
                    else if (currentMonth === 11) {
                        //ноябрь
                        urlAvatar = 'https://proj.uley.team/upload/11_2025.jpg'
                    }
                    else if (currentMonth === 12) {
                        //декабрь
                        urlAvatar = 'https://proj.uley.team/upload/12_2025.jpg'
                    }

                try {
                    //добавление специалиста в БД
                    const user = await Specialist.findOne({where:{chatId: chatId.toString()}})
                    if (!user) {
                        const res = await Specialist.create({
                            fio: workerName2, 
                            //phone: phone2, 
                            age: `${dateBorn}-01-01`,
                            city: city2,                  
                            //worklist: JSON.stringify(specArr),
                            specialization: JSON.stringify(specArr),
                            chatId: chatId,
                            promoId: friend2,
                            profile: urlAvatar,
                        })
                        console.log('Пользователь добавлен в БД')
                    } else {
                        //обновление специалиста, если существует в бд
                        console.log('Отмена добавления в БД. Пользователь уже существует')
                        const res = await Specialist.update({ 
                            fio: workerName2, 
                            //phone: phone2, 
                            age: dateBorn+'-01-01',
                            city: city2,
                            //worklist: JSON.stringify(specArr),
                            specialization: JSON.stringify(specArr),
                            chatId: chatId,
                            promoId: friend2,
                            profile: urlAvatar,
                        },
                        { 
                            where: {chatId: chatId} 
                        })
                        if (res) {
                           console.log("Специалист обновлен! ", chatId) 
                        }else {
                            console.log("Ошибка обновления! ", chatId) 
                        }
                    }
                    

                    


                    //console.log(fio, chatId, age, phone2, specArr2, city2, friend2, urlAvatar)

                    //сохраниь в бд ноушен
                    //const notion = await getWorkerNotion(chatId)
                    //const notion = await Specilist.findOne()
                    
                    //let exist = await Specialist.findOne( {where: {chatId: chatId}} )
                    
                    // if (!exist) {
                    //     //добавить специалиста
                    //     const workerId = await addWorkerDB(fio, chatId, age, specArr2, city2, friend2, urlAvatar)
                    //     console.log('Специалист успешно добавлен в Notion!', workerId)

                    //     //добавить аватар
                    //     //const res = await addAvatar(workerId, urlAvatar)
                    //     //console.log("res upload avatar: ", res)
                    // } else {
                    //     console.log('Специалист уже существует в Notion!')
                    // }

                    //очистить переменные
                    console.log("Очищаю переменные...")
                    //workerFam = '';
                    workerName2 = '';
                    //phone2 = '';
                    dateBorn = '';
                    city2 = '';
                    friend2 = '';
 
                    console.log('Специалист успешно добавлен в БД! Worker: ')

                    const worker = await Specialist.findOne({where:{chatId: chatId.toString()}})
                    console.log("worker great: ", worker)
                    if (!worker.dataValues.great) {
                        setTimeout(async()=> {
                            //Отлично!
                            const res = await bot.sendPhoto(chatId, 'https://proj.uley.team/upload/2024-04-02T12:04:15.826Z.jpg')
                            console.log("res send great: ", res)

                            //отправить сообщение о добавлении специалиста в бд в админ-панель
                            const convId = sendMessageAdmin('https://proj.uley.team/upload/2024-04-02T12:04:15.826Z.jpg', "image", chatId, res.message_id, true)
                            
                            //отправить сообщение в админку
                            socket.emit("sendMessageSpec", {
                                senderId: chatTelegramId,
                                receiverId: chatId,
                                text: 'https://proj.uley.team/upload/2024-04-02T12:04:15.826Z.jpg',
                                type: 'image',
                                convId: convId,
                                messageId: res.message_id,
                                isBot: true,
                            })

                            await Specialist.update({ 
                                great: true
                            },
                            {
                                where: {
                                    chatId: chatId,
                                },
                            })
                        
                        }, 15000)
                    }
                } catch (error) {
                    console.log(error.message)
                }

            } else if (text.startsWith('Специальность успешно добавлена')) {
                setTimeout(async()=> {
                    //Отлично!
                    //await bot.sendPhoto(chatId, 'https://proj.uley.team/upload/2024-04-02T12:04:15.826Z.jpg')

                    //отправить сообщение о добавлении специалиста в бд в админ-панель
                    //const convId = sendMessageAdmin('https://proj.uley.team/upload/2024-04-02T12:04:15.826Z.jpg', "image", chatId, null)

                    const mess = 'Специальность успешно добавлена'
                    const convId = sendMessageAdmin(mess, "text", chatId, null)

                    // Подключаемся к серверу socket
                    let socket = io(socketUrl);
                    socket.emit("addUser", chatId)
                    
                    //отправить сообщение в админку
                    socket.emit("sendMessageSpec", {
                        senderId: chatTelegramId,
                        receiverId: chatId,
                        text: mess, //'https://proj.uley.team/upload/2024-04-02T12:04:15.826Z.jpg',
                        type: 'text',
                        convId: convId,
                        messageId: null,
                        isBot: true,
                    })
                }, 15000)
            } else if (text.startsWith('Твоя ставка отправлена!')) {
                //отправить сообщение в админ-панель
                const convId = await sendMyMessage('Твоя ставка отправлена', "text", chatId)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)
                socket.emit("sendMessageSpec", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: 'Твоя ставка отправлена',
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                    isBot: true,
                })
            
            } else {
//----------------------------------------------------------------------------------------------------------------
                //отправка сообщения 
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)   

                //добавление пользователя в БД USERBOT
                const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId, username: username })
                    console.log('Пользователь добавлен в БД UserBots')
                } else {
                    console.log('Отмена операции! Пользователь уже существует в Userbots')
                    await UserBot.update({ username: username }, {
                        where: {
                          chatId: chatId.toString(),
                        },
                    });
                }

                //добавление пользователя в БД WORKERS
                const userW = await Specialist.findOne({where:{chatId: chatId.toString()}})
                if (!userW) {
                    await Specialist.create({ 
                        fio: lastname + ' ' + firstname, 
                        chatId: chatId, 
                        specialization: JSON.stringify([{
                            spec: 'Вне категории',
                            cat: 'NoTag'
                        }]),
                        promoId: 0,
                        avatar: ''
                    })
                    console.log('Пользователь добавлен в БД Workers')
                } else {
                    console.log('Отмена операции! Пользователь уже существует в Workers')
                }

                //приветствие
                let hello = ''
                const currentDate = new Date()
                const currentHours = new Date(new Date().getTime()+10800000).getHours()

                const countAll = await Message.count({
                    where: { senderId: chatId.toString() },
                });
                const messages = await Message.findAll({
                    order: [
                        ['id', 'ASC'],
                    ],
                    where:{senderId: chatId.toString()}, 
                    offset: countAll > 50 ? countAll - 50 : 0,
                })
                const messagesAll = JSON.parse(JSON.stringify(messages))
                const mess = messagesAll.find((item)=> item.createdAt.split('T')[0] === currentDate.toISOString().split('T')[0])
                //console.log("mess: ", mess)          
                if (mess) {
                    console.log("сегодня были сообщения")
                } else { 
                    if (currentHours >= 6 && currentHours < 12) {
                        hello = 'Доброе утро'
                    } else if (currentHours >= 12 && currentHours < 18) {
                        hello = 'Добрый день'
                    } else if (currentHours >= 0 && currentHours < 6) {
                        hello = 'Доброй ночи'
                    } else {
                        hello = 'Добрый вечер' //18-0
                    }

                    // const nameNotion = await getWorkerNotion(chatId)

                    // //ответ бота
                    // //console.log(`${hello}, ${firstname}`)
                    // let hello_text = ''
                    // if (nameNotion) {
                    //     if (nameNotion[0].fio.indexOf(' ') === -1)  {
                    //         hello_text = `${hello}, ${nameNotion[0].fio}.`
                    //     } else {
                    //         hello_text = `${hello}, ${nameNotion[0].fio.split(' ')[1]}.`
                    //     }
                        
                    // } else {
                    //     hello_text = `${hello}.`
                        
                    // }
                    
                    // const res = await bot.sendMessage(chatId, hello_text)

                    // setTimeout(async()=> {
                    //     // сохранить отправленное боту сообщение пользователя в БД
                    //     const convId = await sendMessageAdmin(hello_text, 'text', chatId, res.message_id, null, false)

                    //     socket.emit("sendAdminSpec", {
                    //         senderId: chatTelegramId,
                    //         receiverId: chatId,
                    //         text: hello_text,
                    //         type: 'text',
                    //         convId: convId,
                    //         messageId: res.message_id,
                    //         isBot: false,
                    //     })
                    // }, 3000)
                    
                        
                }

                //-------------------------------------

                //обработка пересылаемых сообщений
                let str_text;
                let reply_id;
                if (msg.reply_to_message) {
                    const message = await Message.findOne({where:{messageId: msg.reply_to_message.message_id.toString()}}) 
                   str_text = `${message.dataValues.text}_reply_${text}`  
                   reply_id = msg.reply_to_message.message_id              
                } else {
                    str_text = text
                }

                // сохранить отправленное боту сообщение пользователя в БД
                const convId = sendMyMessage(str_text, 'text', chatId, messageId, reply_id)

                socket.emit("sendMessageSpec", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: str_text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                    replyId: reply_id,
                })
            

                //await bot.sendMessage(chatId, 'Я принял ваш запрос!')
                //await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)           
            }
        }

    } catch (error) {
        console.log('Произошла непредвиденная ошибка! ', error.message)
    }
    
  });


  //--------------------------------------------------------------------------------------------------------------------
  
  //Ответ на нажатие кнопок настройки и информаци
  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const messageId = msg.message.message_id;

    //⚠️
//---------------------------------------------------------------------------
    //нажатие на кнопку "Принять"
//---------------------------------------------------------------------------
    if (data.startsWith('/accept')) {
        const project = data.split(' ');
        console.log("project: ", data)
        const projectId = project[1]  

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Принять" в рассылке', "text", chatId, messageId, null, false)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        //socket.emit("addUser", chatId)

        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Принять" в рассылке',
            convId: convId,
            messageId: messageId,
        })  


        //специалист ID Notion
        //const workerId = await getWorkerChatId(chatId)

        //специалист из БД
        const worker = await getWorkerChatId(chatId)
        const workerId = worker.dataValues.id.toString()

        //новый претендент
        const pretendent = {
            projectId: projectId, 
            workerId: workerId, 
            receiverId: chatId,  
            accept: true, 
            otclick: 1     
        }

        let exist = []
        exist = await Pretendent.findAll({
            where: {
                projectId: projectId,
                workerId: workerId,
            },
        })

        console.log("exist: ", exist)

        if (exist.length === 0) {
            const res = await Pretendent.create(pretendent)
            console.log("Претендент добавлен в БД: ", res.dataValues.id)

        } else if (Math.abs(new Date(exist[exist.length-1]?.dataValues.updatedAt).getTime()-new Date().getTime()) > 3600000) { //3600000) {
           const res = await Pretendent.create(pretendent)
           console.log("Претендент еще раз добавлен в БД: ", res.dataValues.id)

        } else {

            console.log('Претендент уже создан в БД для этого проекта!', exist[exist.length-1])
            
            //проверяем отклонил ли специалист заявку в прошлый раз 
            if (exist[exist.length-1].dataValues.accept === false) {         
                const res = await Pretendent.update({            
                    accept:  true,
                    otclick:  1,
                    status: ''
                },
                {
                    where: {
                        projectId: projectId,
                        workerId: workerId,
                    },
                })
            //или было нажато принять
            } else {
                const count = exist[exist.length-1].dataValues.otclick + 1
                const res = await Pretendent.update({ 
                    otclick: count  
                },
                {
                    where: {
                        projectId: projectId,
                        workerId: workerId,
                    },
                })
            }         
        }


        const exist2 = await Pretendent.findAll({
            where: {
                projectId: projectId,
                workerId: workerId,
            },
        })

        if ((exist2[exist2.length-1].dataValues.otclick < 2) || ( Math.abs(new Date(exist[exist.length-1].dataValues.updatedAt).getTime()-new Date().getTime()) ) > 3600000) { //3600000) {

            //отправить сообщение в админ-панель
            const text = 'Заявка принята! Мы свяжемся с вами в ближайшее время.'
            
            const convId2 = await sendMessageAdmin(text, "text", chatId, messageId, null, false)
            
            // Подключаемся к серверу socket
            socket.emit("sendAdminSpec", {
                 senderId: chatTelegramId,
                 receiverId: chatId,
                 text: text,
                 convId: convId2,
                 messageId: messageId,
            })                        
             
            return bot.sendMessage(chatId, text)
        } 

        if (exist2[exist2.length-1].dataValues.otclick > 1) {
            //отправить сообщение в админ-панель
            const convId = await sendMessageAdmin('Вы ' + exist2[exist2.length-1].dataValues.otclick + '-й раз откликнулись на заявку', "text", chatId, null, null, false)

            // Подключаемся к серверу socket
            socket.emit("sendAdminSpec", {
                senderId: chatTelegramId,
                receiverId: chatId,
                text: 'Вы ' + exist2[exist2.length-1].dataValues.otclick + '-й раз откликнулись на заявку',
                convId: convId,
                messageId: null,
                isBot: false,
            })
            return bot.sendMessage(chatId, 'Вы ' + exist2[exist2.length-1].dataValues.otclick + '-й раз откликнулись на заявку')
        }       

        
    }
//----------------------------------------------------------------
    //нажатие на кнопку "Отклонить"
//----------------------------------------------------------------
    if (data.startsWith('/cancel')) {
        const project = data.split(' ');
        console.log("project: ", data)
        const projectId = project[1]

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Отклонить" в рассылке', "text", chatId, messageId, null, true)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        
        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Отклонить" в рассылке',
            convId: convId,
            messageId: messageId,
            isBot: true,
        })


        //специалист
        const worker = await getWorkerChatId(chatId)
        const workerId = worker.dataValues.id.toString()

        //новый претендент
        const pretendent = {
            projectId: projectId, 
            workerId: workerId, 
            receiverId: chatId,  
            accept: false,  
            cancel: 1,
            //status: 'Передумал'    
        }


        //найти претендента в БД
        const exist = await Pretendent.findOne({
            where: {
                projectId: projectId,
                workerId: workerId,
            },
        })

        
        if (exist) {
            console.log('Претендент уже создан в БД для этого проекта!')
            console.log("Exist: ", exist.dataValues)
            //проверяем отклонил ли специалист заявку в прошлый раз
            if (!exist.dataValues.accept) {
                const count = exist.dataValues.cancel + 1
                const res = await Pretendent.update({ 
                    cancel: count  
                },
                {
                    where: {
                        projectId: projectId,
                        workerId: workerId,
                    },
                })
            //или было нажато принять
            } else {
                const res = await Pretendent.update({ 
                    accept: true,
                    cancel: 1,
                    status: 'Передумал' 
                },
                {
                    where: {
                        projectId: projectId,
                        workerId: workerId,
                    },
                })
                console.log("Претендент обновлен в БД")
            }
            
        } else {
            const res = await Pretendent.create(pretendent)
            console.log("Претендент в БД: ", res.dataValues.id)
            console.log("Пользователь отклонил заявку!")
        }

        const exist2 = await Pretendent.findOne({
            where: {
                projectId: projectId,
                workerId: workerId,
            },
        })

        if ((exist2.dataValues.cancel < 2) || ( Math.abs(new Date(exist2.dataValues.createdAt).getTime()-new Date().getTime()) )>3600000) {

            return bot.sendMessage(chatId, "Больше не показывать это предложение даже при условии, что ставка измениться в большую сторону?", {
                reply_markup: ({
                    inline_keyboard: [
                        [
                            {"text": "Показать еще", callback_data:'/todocancel2'}, 
                            {"text": "Не показывать", callback_data:`/todocancel3 ${projectId} ${chatId}`},
                        ],
                    ]
                })
            }) 
        } else {
            //отправить сообщение в админ-панель
            //const convId = await sendMessageAdmin('Отправка заявки временно недоступна. Попробуйте позже', "text", chatId, null, null, true)
            console.log("Время заявки (мин.) ", Math.round(Math.abs(new Date(exist2.dataValues.createdAt).getTime()-new Date().getTime())/60000))
            return bot.sendMessage(chatId, 'Отправка заявки временно недоступна. Попробуйте позже (через ' + parseInt(60 - Math.round(Math.abs(new Date(exist2.dataValues.createdAt).getTime()-new Date().getTime())/60000)) + ' мин.)')
        }

        if (exist2.dataValues.otclick > 1) {
            //отправить сообщение в админ-панель
            const convId = await sendMessageAdmin('Вы ' + exist2.dataValues.cancel +'-й раз нажали кнопку Отклонить', "text", chatId, null, null, true)

            // Подключаемся к серверу socket
            socket.emit("sendAdminSpec", {
                senderId: chatTelegramId,
                receiverId: chatId,
                text: 'Вы ' + exist2.dataValues.cancel +'-й раз нажали кнопку Отклонить',
                convId: convId,
                messageId: null,
                isBot: true,
            })
            return bot.sendMessage(chatId, 'Вы ' + exist2.dataValues.cancel +'-й раз нажали кнопку Отклонить')
        } 

        //отправить сообщение в админ-панель
        const text = 'Хорошо, тогда в следующий раз!'
            
        const convId2 = await sendMessageAdmin(text, "text", chatId, messageId, null, false)
        
        // Подключаемся к серверу socket
        socket.emit("sendAdminSpec", {
             senderId: chatTelegramId,
             receiverId: chatId,
             text: text,
             convId: convId2,
             messageId: messageId,
        })                        
         
        return bot.sendMessage(chatId, text)
        
    }

    if (data === '/todocancel2') {
        return bot.sendMessage(chatId, `Принято показать еще раз`)  
    }

    //заблокировать рассылку по проекту
    if (data.startsWith('/todocancel3')) {
        const project = data.split(' ');
        console.log("project: ", data)
        const projectId = project[1]
        console.log("projectId: ", projectId)
        
        //const worker = data.split(' ');
        const workerId = project[2]
        console.log("workerId: ", workerId)

        try {
            const res = await Pretendent.update({ 
                blockDistrib: true
            },
            {
                where: {
                    projectId: projectId,
                    receiverId: workerId,
                },
            })
            console.log("Претендент обновлен в БД", res) 
        } catch (error) {
            console.log("Ошибка обновления претендента!")
            console.error(error.message)
        } 
        
        return bot.sendMessage(chatId, `Хорошо, тогда в следующий раз!`)  

    }

    //----------------------------------------------------------------
    //нажатие на кнопку "Приянто/Понято"
    //----------------------------------------------------------------
    if (data.startsWith('/poster_accept')) {

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Принято / Понято"', "text", chatId, messageId, null, true)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        
        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Принято / Понято"',
            convId: convId,
            messageId: messageId,
            isBot: true,
        }) 

        for (let i=1; i<=5; i++) {
           setTimeout(()=> {
                bot.deleteMessage(chatId, Number(messageId-1))  
                bot.deleteMessage(chatId, Number(messageId-2))  
                bot.deleteMessage(chatId, Number(messageId-3))
                bot.deleteMessage(chatId, Number(messageId-4)) 
                bot.deleteMessage(chatId, Number(messageId-5)) 
           }, 500 * i) 
        }

        console.log("messagesId: ", messageId, Number(messageId-1), Number(messageId-2), Number(messageId-3), Number(messageId-4), Number(messageId-5))

        return bot.deleteMessage(chatId, messageId)  
    }

    if (data.startsWith('/poster_accept1')) {

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Принято / Понято"', "text", chatId, null, null, true)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        
        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Принято / Понято"',
            convId: convId,
            messageId: null,
            isBot: true,
        }) 

        //for (let i=1; i<=5; i++) {
           //setTimeout(()=> {
                // bot.deleteMessage(chatId, Number(messageId-1))  
                // bot.deleteMessage(chatId, Number(messageId-2))  
                // bot.deleteMessage(chatId, Number(messageId-3))
                // bot.deleteMessage(chatId, Number(messageId-4)) 
                // bot.deleteMessage(chatId, Number(messageId-5)) 
           //}, 500 * i) 
        //}
        console.log("messagesId: ", messageId, Number(messageId-1), Number(messageId-2), Number(messageId-3), Number(messageId-4), Number(messageId-5))

        return bot.deleteMessage(chatId, messageId)  
    }



    //нажатие на кнопку "Кнопка"
    if (data.startsWith('/report')) {
        const target = data.split(' ');
        console.log("target: ", data)
        const targetUrl = target[1]
        try {
            const res = await $host.get(targetUrl)
            console.log("res: ", res)
        } catch (error) {
            console.log(error.message)
        }    
    }



    if (data === '/passport2') {
        return bot.sendMessage(chatId, `Ваш отказ принят.
До встречи на следующем проекте!`)  

    }

    if (data === '/passport3') {
        bot.sendMessage(chatId, "Иногда заказчики требуют персональные данные  специалистов приглашенных на проект, в этом случае участие в нем возможно только после предоставления необходимых данных.", {
            reply_markup: ({
                inline_keyboard: [
                    [
                        {"text": "Согласен предоставить персональные данные", web_app: {url: webAppUrlPas}}, 
                    ],
                    [
                        {"text": "Отказываюсь от предоставления данных и участия в проектах", callback_data:'/passport2'},
                    ],
                ]
            })
        }) 

    }

  });

//функция задержки
const delay = async(ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
}




const fetchNotif = async (dataAll) => {

    let d = new Date()
    d.setHours(d.getHours() + 3);

	console.log("Получено уведомление: ", dataAll, d)
	const { task, data } = dataAll;

	if (task === 301) {

       //console.log("NOTIF 300: ", data[0].telegram_id, data[0].srm_id, data[0].chat_link)

       const text = 'Добрый день, для добавления вас в чат проекта необходимо ...'

       let keyboard 
       const image = 'https://proj.uley.team/upload/2024-06-14T11:12:57.724Z.jpeg'
       const image2 = 'https://proj.uley.team/upload/2024-06-14T11:13:15.065Z.jpeg'

       data.map(async(item, i)=> {
        setTimeout(async() => {
            keyboard = JSON.stringify({
                inline_keyboard: [
                    [
                        {"text": 'Перейти в чат', url: item.chat_link.replace('+','%2b')},
                    ],
                ]
            });

            try {
                //const url_send_msg = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${item.telegram_id}&parse_mode=html&text=${text.replace(/\n/g, '%0A')}`
                const url_send_photo = `https://api.telegram.org/bot${token}/sendPhoto?chat_id=${item.telegram_id}&photo=${image}`
                const url_send_photo2 = `https://api.telegram.org/bot${token}/sendPhoto?chat_id=${item.telegram_id}&photo=${image2}&reply_markup=${keyboard}`

                //const sendTextToTelegram = await $host.get(url_send_msg)
                
                //1
                const sendPhotoToTelegram = await $host.get(url_send_photo)

                //отправить сообщение в админ-панель
                const convId = sendMessageAdmin(image, "image", item.telegram_id, null, true)

                // Подключаемся к серверу socket
                let socket2 = io(socketUrl);
                socket2.emit("addUser", item.telegram_id)
                socket2.emit("sendAdminSpec", {
                    senderId: chatTelegramId,
                    receiverId: item.telegram_id,
                    text: image,
                    type: 'image',
                    convId: convId,
                    messageId: null,
                    isBot: true,
                })

                //2
                const sendPhotoToTelegram2 = await $host.get(url_send_photo2)

                //отправить сообщение в админ-панель
                const convId2 = sendMessageAdmin(image2, "image", item.telegram_id, null, true)

                socket2.emit("sendAdminSpec", {
                    senderId: chatTelegramId,
                    receiverId: item.telegram_id,
                    text: image2,
                    type: 'image',
                    convId: convId2,
                    messageId: null,
                    isBot: true,
                })
            } catch (error) {
                console.error("Ошибка отправки приглашения специалисту", url_send_photo)
            }
            
            
        }, 1000 * ++i)
})
        
    }
}

const fetchProcess = async (dataAll) => {

    let d = new Date()
    d.setHours(d.getHours() + 3);

	console.log("Получен процесс W: ", dataAll, d)
	const { process, data, interval, time } = dataAll;

	if (process === 1) {
        currentProcess = 1
        dataProcess = data
        dataInterval = interval
        dataTime = time
    }
}


//-------------------------------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8001;

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        
        httpsServer.listen(PORT, async() => {
            console.log('HTTPS Server BotWorker running on port ' + PORT);

            // Подключаемся к серверу socket
            //let socket = io(socketUrl);
            socket.on("getWorker", fetchNotif);

            socket.on("getProcess", fetchProcess);

            //передаем данные о функции
            console.log("send process W: ", 3)
            socket.emit("sendProcess", {
                process: '3',
                data: true,
                interval: '10',
                time: 'M',
            })

            // 86400 секунд в дне
            //var minutCount = 0;
            //let i = 0;

            // повторить с интервалом 10 минут
            //let timerId = setInterval(async() => {

                //console.log("START GET PROJECTS ALL...")
                //const projects = await getProjectsAll()

                // await Projectcash.truncate();

                // projects.map(async(project)=> {
                //     await Projectcash.create({ 
                //         id: project.id, 
                //         title: project.title, 
                //         dateStart: project.date_start, 
                //         dateEnd: project.date_end, 
                //         tgURLchat: project.tgURL_chat,
                //         manager: project.managerId,
                //         status: JSON.stringify(project.status), 
                //         specs: JSON.stringify(project.specs)  
                //     })
                // })
                
                //-----------------------------------------------------

                //console.log("START GET SMETA ALL...")
                // const smets = await getSmetaAll()

                // //очистить таблицу
                // await Smetacash.truncate();
                
                // smets.map(async(smeta)=> {
                //     await Smetacash.create({ 
                //         id: smeta.id, 
                //         projectId: smeta.projectId, 
                //         title: smeta.title, 
                //         final: smeta.final,
                //         dop: JSON.stringify(smeta.dop)  
                //     })
                // })  

                //передаем данные о функции
                // console.log("send process W: ", 3)
                // socket.emit("sendProcess", {
                //     process: '3',
                //     data: true,
                //     interval: '10',
                //     time: 'M',
                // })

                //i++ // счетчик интервалов
            //}, 600000); //каждые 10 минут
//-----------------------------------------------------
            //перезапустить бота через 12 часов
            setTimeout(()=> {
                //const chat_id = msg.chat.id;
                let proc = 'botworker';
                pm2.restart(proc, function(err, pr) {
                    if (err) {
                        errorTelegram(err);
                    }

                });
            }, 43200000) //86400000
//------------------------------------------------------

            //запуск сканирования отказа специалисту
            //let j = 1000
            // while(j) { 
            //     await getOtkaz(bot)
            //     j--
            // }
        });

    } catch (error) {
        console.log('Подключение к БД сломалось!', error.message)
    }
}

start()