require("dotenv").config();

//подключение к БД PostreSQL
const sequelize = require('../connections/db')
const {Canceled, Worker} = require('../models/models')
const getProjectName = require("./getProjectName");
const getWorkerPretendent = require('./getWorkerPretendent')
const sendMessageAdmin = require("./sendMessageAdmin");

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

const chatTelegramId = process.env.CHAT_ID
const { Op } = require('sequelize')

module.exports = async function getOtkaz(bot) {
    console.log("ЗАПУСКАЮ СКАНИРОВАНИЕ ОТКАЗОВ СПЕЦИАЛИСТАМ...")

    let responseResults

    try {
        //1
        const response = await notion.databases.query({
            database_id: databaseId,
            //page_size: 30,
            "filter": 
            {
                "timestamp": "created_time",
                "created_time": {
                    "after": "2024-01-30"
                }
            }
        });

        responseResults = response.results.map((page) => {
            return {
                id: page.id,
                title: page.properties.Name.title[0]?.plain_text,
                status: page.properties["Статус проекта"].select,
            };
        });

    } catch (error) {
        console.error(error.message)
    }

    console.log("projects: ", responseResults.length)

    const currentDate = new Date()
    //получить все запуски сканирования отказов
    const bdOtkazi = await Canceled.findAll({
        order: [
            ['id', 'ASC'],
        ],
        where: {
            cancel: false,
            // datestart: {
            //     [Op.gte]: currentDate,
            // },
        }
    })


    if (bdOtkazi && bdOtkazi.length > 0) {
        const otkazi = bdOtkazi.filter((item)=> new Date(item.dataValues.datestart) >= currentDate || new Date(item.dataValues.dateend <= currentDate))
        console.log("filterOtkaz: ", otkazi.length)
        //console.log("projects: ", responseResults?.length)

        const newOtkaz = otkazi.map((item)=> {
            const res = responseResults.find((proj)=> proj.id === item.dataValues.projectId)
            if (res) {
                item
            }
        })

        console.log("Новые Отказы ", newOtkaz.length)

        let j = 0

        if (otkazi && otkazi.length > 0) {
            console.log("Отказы ", otkazi.length)
            //otkazi.forEach(async (item, index)=> {
            while (j < otkazi.length) { 
                let d = new Date()
                d.setHours(d.getHours() + 3);
                console.log("Цикл ", j+1, d)
                const blockId = otkazi[j].dataValues.blockId
                const workerId = otkazi[j].dataValues.workerId
                const projectId = otkazi[j].dataValues.projectId
                const chatId = otkazi[j].dataValues.receiverId

                try {
                    const projectName = await getProjectName(projectId)
                    const user = await Worker.findOne({where:{chatId: chatId.toString()}})

                    const cancel = await Canceled.findOne({where:{workerId, projectId, blockId}})
                    //console.log('cancel: ', cancel)

                    // повторить с интервалом 5 секунд (проверка статуса претендента)
                    if (!cancel.dataValues.cancel) {
                        //запрос в ноушен
                        const worker = await getWorkerPretendent(blockId, workerId, projectName.properties?.Name.title[0].plain_text)
                        console.log("WORKER (bot): ", worker?.status, chatId, projectName.properties?.Name.title[0].plain_text)

                        if (worker && worker.find(item => item.status === "Отказано")) {
                            const currentHours = new Date(new Date().getTime()+10800000).getHours()

                            const res = await Canceled.update(
                            { 
                                cancel: true  
                            },
                            {
                                where: {
                                    projectId: projectId,
                                    workerId: workerId,
                                },
                            })

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

                            const report = bot.sendMessage(chatId, text)
                        
                            const convId = await sendMessageAdmin(text, "text", chatId, report.message_id, null, false)
                                                    
                            // Подключаемся к серверу socket
                            let socket = io(socketUrl);
                            //socket.emit("addUser", chatId)
                            socket.emit("sendAdminSpec", {
                                senderId: chatTelegramId,
                                receiverId: chatId,
                                text: text,
                                convId: convId,
                                messageId: report.message_id,
                            }) 
                            
                            
                        }
                    } 
                } catch (error) {
                    console.error("Ошибка в системе отказов претендентам", new Date().toISOString())
                }

            j++       
            await delay(10000) // 10 сек
            }
        }   
    } else {
        console.log("Ошибка получения из БД массива отказов")
    }       
    
}  

//функция задержки
const delay = async(ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
}