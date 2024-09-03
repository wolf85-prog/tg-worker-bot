require("dotenv").config();

//подключение к БД PostreSQL
const sequelize = require('../connections/db')
const {Message, Conversation} = require('../models/models')
const chatTelegramId = process.env.CHAT_ID
const { Op } = require('sequelize');
const getWorkerNotion = require("./getWorkerNotion");
const sendMessageAdmin = require("./sendMessageAdmin");

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

module.exports = async function sendHello(bot, chatId, messageId) {
    //создать беседу в админке в бд 
    //сохранить отправленное боту сообщение пользователя в БД
    let  conversation_id              
    try {                  
        //найти беседу
        const conversation = await Conversation.findOne({
            where: {
                members: {
                    [Op.contains]: [chatId]
                }
            },
        })   
        
        //console.log("conversation: ", conversation)

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

            const nameNotion = await getWorkerNotion(chatId)

            //ответ бота
            //console.log(`${hello}, ${firstname}`)
            let hello_text = ''
            if (nameNotion) {
                if (nameNotion[0].fio.indexOf(' ') === -1)  {
                    hello_text = `${hello}, ${nameNotion[0].fio}.`
                } else {
                    hello_text = `${hello}, ${nameNotion[0].fio.split(' ')[1]}.`
                }
                
            } else {
                hello_text = `${hello}.`
                
            }
            
            const res = await bot.sendMessage(chatId, hello_text)

            setTimeout(async()=> {
                // сохранить отправленное боту сообщение пользователя в БД
                const convId = await sendMessageAdmin(hello_text, 'text', chatId, res.message_id, null, false)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("sendAdminSpec", {
                    senderId: chatTelegramId,
                    receiverId: chatId,
                    text: hello_text,
                    type: 'text',
                    convId: convId,
                    messageId: res.message_id,
                    isBot: false,
                })
            }, 3000)

        }


        return conversation_id;
    } catch (error) {
        console.log(error)
    }
}          