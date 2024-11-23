const {Worker, Specialist} = require('../models/models')

require("dotenv").config();

const {specData} = require('../data/specData');
const host = process.env.HOST

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
            console.log("project: ", project)
            const projectName = project.dataValues.name

            const worker = await getWorkerId(id)
            console.log("worker: ", worker.dataValues.fio)


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
            const text = `${hello}, ${worker.split(' ')[1]}! 
            Спасибо, что откликнулись на проект «${projectName}». В настоящий момент основной состав уже сформирован. 
            Будем рады сотрудничеству на новых проектах!`
        
            // const report = bot.sendMessage(chatId, text)
                                
            // const convId = await sendMessageAdmin(text, "text", chatId, report.message_id, null, false)
                                                            
            // // Подключаемся к серверу socket
            // let socket = io(socketUrl);
            // //socket.emit("addUser", chatId)
            // socket.emit("sendAdminSpec", {
            //     senderId: chatTelegramId,
            //     receiverId: chatId,
            //     text: text,
            //     convId: convId,
            //     messageId: report.message_id,
            // })                                                                  
            return res.status(200).json(text);
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

}

module.exports = new SpecialistController()