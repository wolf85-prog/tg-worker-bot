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

module.exports = async function getOtkazTest(bot) {
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

            //отправить сообщение в админ-панель
            const text = `${hello}, ${user.dataValues.username}! 
    Спасибо, что откликнулись на проект «${projectName.properties?.Name.title[0].plain_text}». В настоящий момент основной состав уже сформирован. 
    Будем рады сотрудничеству на новых проектах!`

            const report = bot.sendMessage('805436270', text)
                    
            delay(5000)
        })
    }           
    
}  

//функция задержки
const delay = async(ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
}