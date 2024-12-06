const {Worker, Specialist} = require('../models/models')

require("dotenv").config();
const axios = require("axios");

const {specData} = require('../data/specData');
const host = process.env.HOST

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

const https = require('https');
const fs = require('fs');
const path = require('path')
const sharp = require('sharp');

//socket.io
const {io} = require("socket.io-client");
const socketUrl = process.env.SOCKET_APP_URL

const chatTelegramId = process.env.CHAT_ID
const { Op } = require('sequelize');
const getProjectName = require('../common/getProjectName');
const getWorkerChatId = require('../common/getWorkerChatId');
const getWorkerId = require('../common/getWorkerId');
const sendMessageAdmin = require("../common/sendMessageAdmin");

const token = process.env.TELEGRAM_API_TOKEN_WORK

class SpecialistController {

    async getSpecialist(req, res) {
        try {
            const workers = await Specialist.findAll({
                order: [
                    ['id', 'DESC'], //DESC, ASC
                ],
            })
            return res.status(200).json(workers);
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

    async getSpecCount(req, res) {
        const kol = req.params.count
        const prev = req.params.prev
        try {
            const count = await Specialist.count();
            //console.log(count)

            const k = parseInt(kol) + parseInt(prev)

            const workers = await Specialist.findAll({
                order: [
                    ['id', 'ASC'], //DESC, ASC
                ],
                offset: count > k ? count - k : 0,
                //limit : 50,
            })
            return res.status(200).json(workers);
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }


    async editSpecialist(req, res) { 
        const {id} = req.params      
        try {    
            let exist=await Specialist.findOne( {where: {id: id}} )
            
            if(!exist){
                res.status(500).json({msg: "user not exist"});
                return;
            }

            const {fio, city, age, speclist} = req.body

            const newUser = await Specialist.update(
                { 
                    fio, 
                    city,
                    age,
                    specialization: speclist
                },
                { where: {id: id} })
            return res.status(200).json(newUser);
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

    // async getSpecialistId(req, res) {
    //     const {id} = req.params
    //     try {
    //         const workers = await Specialist.findOne({where: {chatId: id.toString()}})
    //         return res.status(200).json(workers);
    //     } catch (err) {
    //         return res.status(500).json(err);
    //     }
    // }


    async sendOtkaz(req, res) {
        const {id} = req.params 
        const {projectId} = req.body

        try {
            const project = await getProjectName(projectId)
            console.log("project: ", project.dataValues.name)
            const projectName = project.dataValues.name

            const worker = await getWorkerId(id)
            const chatId = worker.dataValues.chatId
            //console.log("worker: ", worker.dataValues)


            let hello = ''
            const currentHours = new Date(new Date().getTime()+10800000).getHours()
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
            const text = `${hello}, ${worker.dataValues.fio?.split(' ')[1] ? worker.dataValues.fio?.split(' ')[1] : worker.dataValues.fio}! 
Спасибо, что откликнулись на проект «${projectName}». В настоящий момент основной состав уже сформирован. 
Будем рады сотрудничеству на новых проектах!`
            let sendTextToTelegram
            if (text !== '') {
                const url_send_msg = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&parse_mode=html&text=${text.replace(/\n/g, '%0A')}`

                console.log("Отправка текста...", url_send_msg)
                
                sendTextToTelegram = await $host.get(url_send_msg)
                //const report = bot.sendMessage(chatId, text)
                                    
                const convId = await sendMessageAdmin(text, "text", chatId, sendTextToTelegram.message_id, null, false)
                
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                //socket.emit("addUser", chatId)
                socket.emit("sendAdminSpec", {
                    senderId: chatTelegramId,
                    receiverId: chatId,
                    text: text,
                    convId: convId,
                    messageId: sendTextToTelegram.message_id,
                }) 
            }
                                                                
            return res.status(200).json(sendTextToTelegram);
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

}

module.exports = new SpecialistController()