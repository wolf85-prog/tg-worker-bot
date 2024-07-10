require("dotenv").config();

//подключение к БД PostreSQL
const sequelize = require('../connections/db')
const {Canceled, Worker} = require('../models/models')
const getProjectName = require("./getProjectName");
const getWorkerPretendent = require('./getWorkerPretendent')
const sendMessageAdmin = require("./sendMessageAdmin");

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

const chatTelegramId = process.env.CHAT_ID
const { Op } = require('sequelize')

module.exports = async function getOtkaz(bot) {
    console.log("ЗАПУСКАЮ СКАНИРОВАНИЕ ОТКАЗОВ СПЕЦИАЛИСТАМ...")

    //получить все запуски сканирования отказов
    const otkazi = await Canceled.findAll({
        order: [
            ['id', 'ASC'],
        ],
        where: {
            cancel: false
        }
    })

    if (otkazi && otkazi.length > 0) {
        console.log("Отказы ", otkazi.length)
        otkazi.forEach(async (item, index)=> {
            //console.log("Цикл ", index+1)
            const blockId = item.dataValues.blockId
            const workerId = item.dataValues.workerId
            const projectId = item.dataValues.projectId
            const chatId = item.dataValues.receiverId
            const projectName = await getProjectName(projectId)
            const user = await Worker.findOne({where:{chatId: chatId.toString()}})

            // повторить с интервалом 5 секунд (проверка статуса претендента)
            setTimeout(async() => {
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
            //delay(5000)
            }, 4000 * ++index) // 5 сек
        })
    }           
    
}  

//функция задержки
const delay = async(ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
}