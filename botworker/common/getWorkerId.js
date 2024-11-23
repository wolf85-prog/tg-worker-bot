require("dotenv").config();
const {Specialist} = require('../models/models');

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerId(id) {
    try {

        //сохранение сообщения в базе данных wmessage
        const workerId = await Specialist.findOne({where: {id: id.toString()}})

        return workerId;

    } catch (error) {
        console.error(error.message)
    }
}