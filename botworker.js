require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_API_TOKEN
const bot = new TelegramBot(token, {polling: true});

// web-приложение
const webAppUrl = process.env.WEB_APP_URL;
const botApiUrl = process.env.REACT_APP_API_URL
const webAppUrlPas = process.env.WEB_APP_URL + '/add-passport';

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

//fetch api
const fetch = require('node-fetch');

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
const chatTelegramId = process.env.CHAT_ID

let workerId, workerFam, workerName2, phone2, dateBorn, Worklist, city2, stag2, companys2;

//functions
const getBlocksP = require('./botworker/common/getBlocksP')
const addPretendent = require('./botworker/common/addPretendent')
const sendMyMessage = require('./botworker/common/sendMyMessage')

const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const app = express();
const router = require('./botworker/routes/index')
const path = require('path')

//подключение к БД PostreSQL
const sequelize = require('./botworker/connections/db')
const {UserBot, Message, Conversation, Worker, Pretendent} = require('./botworker/models/models');
const addWorker = require("./botworker/common/addWorker");
const getWorkerNotion = require("./botworker/common/getWorkerNotion");
const addPassport = require("./botworker/common/addPassport");
const addImage = require("./botworker/common/addImage");
const updatePretendent = require("./botworker/common/updatePretendent");
const updateWorker = require("./botworker/common/updateWorker");

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


//--------------------------------------------------------------------------------------------------------
//              REQUEST
//--------------------------------------------------------------------------------------------------------

//создание страницы (проекта) базы данных проектов
app.post('/web-data', async (req, res) => {
    const {queryId, workerfamily, workerName, phone, worklist, 
        city, dateborn} = req.body;
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
            Worklist = worklist 
            console.log("Сохранение данных завершено: ", workerFam)
            
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Данные успешно добавлены',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Данные успешно добавлены!
  
<b>Фамилия:</b> ${workerfamily} 
<b>Имя:</b> ${workerName} 
<b>Телефон:</b> ${phone} 
<b>Год рождения:</b> ${dateborn}
<b>Город:</b> ${city} 
  
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

//добавление паспорта
app.post('/web-addspec', async (req, res) => {
    const {queryId, worklist, user} = req.body;

    try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Данные успешно добавлены',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Данные успешно добавлены!

<b>Специальности:</b> 
${worklist.map(item =>' - ' + item.spec).join('\n')}`
            }
            })

            console.log("Начинаю сохранять данные в ноушене...", user?.id)

            //сохраниь в бд ноушен
            const res = await getWorkerNotion(user?.id)
            let arrSpec =[]
            const oldlist = res[0].spec
            console.log("Worklist: ", oldlist)

            //массив специалистов
            oldlist.forEach(item => {               
                const obj = {
                    name: item.name,
                }
                arrSpec.push(obj)
            });

            worklist.forEach(item => {               
                const obj = {
                    name: item.name,
                }
                arrSpec.push(obj)
            });

            await updateWorker(res[0].id, arrSpec)
 

        return res.status(200).json({});
    } catch (e) {
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

<b>Дата рождения:</b> ${pasDateborn.split('-')[2]}.${pasDateborn.split('-')[1]}.${pasDateborn.split('-')[0]}
<b>Серия и номер:</b> ${pasNumber.split(' ')[0]} ${pasNumber.split(' ')[1]}
<b>Дата выдачи:</b> ${pasDate.split('-')[2]}.${pasDate.split('-')[1]}.${pasDate.split('-')[0]} 
<b>Кем выдан:</b> ${pasKem}
<b>Код подразделения:</b> ${pasKod}
<b>Место рождения:</b> ${pasPlaceborn}
<b>Адрес регистрации:</b> ${pasAdress}
<b>Email:</b> ${pasEmail}
<b>Аватар:</b> ${image}
` 
            }})

            console.log("Начинаю сохранять данные в ноушене...", user?.id)
            console.log("Картинка: ", image)
  
            const pass_str = `${pasFam} ${pasName} ${pasSoname} 
                            
Паспорт: ${pasNumber.split(' ')[0]} ${pasNumber.split(' ')[1]}
Дата рождения: ${pasDateborn.split('-')[2]}.${pasDateborn.split('-')[1]}.${pasDateborn.split('-')[0]}
Выдан: ${pasKem} 
Дата выдачи: ${pasDate.split('-')[2]}.${pasDate.split('-')[1]}.${pasDate.split('-')[0]}   
Код подразделения: ${pasKod}
                            
Место рождения: ${pasPlaceborn}
                            
Адрес регистрации: ${pasAdress}` 

            const worker = await getWorkerNotion(user?.id)
            console.log("passport: ", worker[0].passport)

            //сохраниь в бд ноушен
            if (!worker[0].passport) {
                console.log("Начинаю сохранять паспорт...")
                const res_pas = await addPassport(pass_str, worker[0]?.id)
                console.log("add_pas: ", res_pas)
            
                const res_img = await addImage(image, worker[0]?.id)
                console.log("add_image: ", res_img)
            } else {
                console.log("Паспорт уже существует!")
            }    

        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})


//добавление паспорта
app.post('/web-stavka', async (req, res) => {
    const {queryId, summaStavki, id} = req.body;

    try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Твоя ставка отправлена',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Твоя ставка ${summaStavki} отправлена!`}})

            console.log("Начинаю сохранять данные в ноушене...", id)

            console.log("ID: ", id)

            //сохраниь в бд ноушен

            const user = await Pretendent.findOne({where: {id}}) 
            
            //обновить поле accept на true (принял)
            await Pretendent.update({ accept: true }, {
                where: {
                    id: id,
                },
            }); 

            const blockId = await getBlocksP(user.projectId); 
            console.log("Ставка: ", blockId)   
        
            //Добавить специалиста в таблицу Претенденты со своей  ставкой
            await addPretendent(blockId, user.workerId, summaStavki);
 

        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})


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
                await UserBot.update({ username: username }, {
                    where: {
                      chatId: chatId.toString(),
                    },
                });
            }

//             await bot.sendMessage(chatId, `Привет! Я Workhub бот!
// Присоединяйся к нашей дружной команде профессионалов!`, {
//                     reply_markup: ({
//                         inline_keyboard:[
//                             [{text: 'Поехали!', web_app: {url: webAppUrl}}],
//                         ]
//                     })
//             })   

                await bot.sendPhoto(chatId, 'https://proj.uley.team/upload/2023-11-10T10:37:06.398Z.png', {
                    reply_markup: ({
                        inline_keyboard:[
                            [{text: 'Поехали!', web_app: {url: webAppUrl}}],
                        ]
                    })
                })
        }



        if (text === '/addspec') {
            try {
                //создание проекта в БД
                const res = await Worker.create({
                   userfamily: 'иванов', 
                   username: 'сергей', 
                   phone: '', 
                   dateborn: '',
                   city: '', 
                   companys: '',
                   stag: '',                      
                   worklist: JSON.stringify([{}]),
                   chatId: chatId
                })

                console.log('Специалист успешно добавлен в БД! Worker: ' + res.username)

               } catch (error) {
                   console.log(error.message)
               }
        }

        if (text === '/addImage') {
            const img = 'https://proj.uley.team/upload/2023-10-14T16:19:25.849Z.png'
            const pageId = '38eaccfbe06740d1a136e0d123905ebf'
            const res = await addImage(img, pageId)
        }

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
            const convId = await sendMyMessage(text_contact, "text", chatId, messageId)
                
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

            // Проект успешно создан
            } else if (text.startsWith('Данные успешно добавлены!')) {           
                const response = await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

                //console.log("Отправляю сообщение в админ-панель...")    
                
                //отправить сообщение о добавлении специалиста в бд в админ-панель
                //const convId = sendMyMessage(text, "text", chatId, parseInt(response.message_id)-1)
                
                // Подключаемся к серверу socket
                // let socket = io(socketUrl);
                // socket.emit("addUser", chatId)
                  
                 //отправить сообщение в админку
                // socket.emit("sendMessageSpec", {
                //     senderId: chatId,
                //     receiverId: chatTelegramId,
                //     text: text,
                //     type: 'text',
                //     convId: convId,
                //     messageId: parseInt(response.message_id)-1,
                // })
 
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

                try {
                    //добавление специалиста в БД
                    const res = await Worker.create({
                        userfamily: workerFam, 
                        username: workerName2, 
                        phone: phone2, 
                        dateborn: dateBorn,
                        city: city2, 
                        //companys: companys2,
                        //stag: stag2,                      
                        worklist: JSON.stringify(specArr),
                        chatId: chatId,
                    })

                    const fio = workerFam + ' '+ workerName2 + ' [Workhub]'
                    const age = `${dateBorn}-01-01`

                    console.log(fio, chatId, age, phone2, specArr2, city2)

                    //сохраниь в бд ноушен
                    await addWorker(fio, chatId, age, phone2, specArr2, city2)

                    //очистить переменные
                    console.log("Очищаю переменные...")
                    workerFam = '';
                    workerName2 = '';
                    phone2 = '';
                    dateBorn = '';
                    city2 = '';
 
                    console.log('Специалист успешно добавлен в БД! Worker: ' + res.username)

                    await bot.sendMessage(chatId, `Отлично, ${res.username}!
Внимательно следи за этим чатом.
Именно здесь будут размещаться весь поток поступающих заявок.
                    
Увидимся на наших проектах! 😈`)

                } catch (error) {
                    console.log(error.message)
                }

            } else {
//----------------------------------------------------------------------------------------------------------------
                //отправка сообщения    

                //добавление пользователя в БД
                const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId, username: username })
                    console.log('Пользователь добавлен в БД')
                } else {
                    console.log('Отмена операции! Пользователь уже существует')
                    await UserBot.update({ username: username }, {
                        where: {
                          chatId: chatId.toString(),
                        },
                    });
                }

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

                // Подключаемся к серверу socket
                let socket = io(socketUrl);

                socket.emit("addUser", chatId)

                socket.emit("sendMessageSpec", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: str_text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                    replyId: reply_id,
                })


                // ответ бота
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

    //нажатие на кнопку "Принять"
    if (data.startsWith('/accept')) {
        const pretendentId = data.split(' ');
        console.log("pretendentId: ", data)
        const id = pretendentId[1]

        const user = await Pretendent.findOne({where: {id}})

        //обновить поле accept на true (принял)
        await Pretendent.update({ accept: true }, {
            where: {
                id: id,
            },
        });           

        const blockId = await getBlocksP(user.projectId);    
        
        //Добавить специалиста в таблицу Претенденты
        await addPretendent(blockId, user.workerId);

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Принять" в рассылке', "text", chatId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Принять" в рассылке',
            convId: convId,
            messageId: messageId,
        })              

        return bot.sendMessage(chatId, 'Ваша заявка принята! Мы свяжемся с вами в ближайшее время.')
    }

    //нажатие на кнопку "Отклонить"
    if (data === '/cancel') {
        const pretendentId = data.split(' ');
        console.log("pretendentId: ", data)
        const id = pretendentId[1]

        const user = await Pretendent.findOne({where: {id}})

        //обновить поле accept на true (принял)
        await Pretendent.update({ accept: false }, {
            where: {
                id: id,
            },
        });
                  
        const blockId = await getBlocksP(user.projectId);    
        
        const workerId = await getWorkerPretendent(blockId)
        
        //Добавить специалиста в таблицу Претенденты
        await updatePretendent(blockId);

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Отклонить" в рассылке', "text", chatId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Отклонить" в рассылке',
            convId: convId,
            messageId: messageId,
        })

        return bot.sendMessage(chatId, 'Хорошо, тогда в следующий раз!')
    }


    //нажатие на кнопку "Отклонить"
    if (data === '/worker') {
        //отправить сообщение в админ-панель
        //const convId = await sendMyMessage('Вы уже зарегистрированы!', chatId)

        return bot.sendMessage(chatId, 'Вы уже зарегистрированы!')
    }



    if (data === '/passport2') {
        //отправить сообщение в админ-панель
        //const convId = await sendMyMessage('Согласен!', chatId)

        // Подключаемся к серверу socket
        // let socket = io(socketUrl);
        // socket.emit("addUser", chatId)
        // socket.emit("sendMessageSpec", {
        //     senderId: chatId,
        //     receiverId: chatTelegramId,
        //     text: 'Пользователь нажал кнопку "Согласен"',
        //     type: 'text',
        //     convId: convId,
        //     messageId: messageId,
        // })

        return bot.sendMessage(chatId, `Ваш отказ принят.
До встречи на следующем проекте!`)  

    }

    if (data === '/passport3') {
        //отправить сообщение в админ-панель
        //const convId = await sendMyMessage('Согласен!', chatId)

        // Подключаемся к серверу socket
        // let socket = io(socketUrl);
        // socket.emit("addUser", chatId)
        // socket.emit("sendMessageSpec", {
        //     senderId: chatId,
        //     receiverId: chatTelegramId,
        //     text: 'Пользователь нажал кнопку "Согласен"',
        //     type: 'text',
        //     convId: convId,
        //     messageId: messageId,
        // })

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
        console.log('Подключение к БД сломалось!', error.message)
    }
}

start()