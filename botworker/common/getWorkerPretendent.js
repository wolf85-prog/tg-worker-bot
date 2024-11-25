require("dotenv").config();
const sequelize = require('../connections/db')
const {Pretendent} = require('../models/models')

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerPretendent(receiverId, projectId) {
    try {
        const count = await Pretendent.count({
            where: { receiverId, projectId },
          });
        //console.log(count)

        const worker = await Pretendent.findOne({
            where: {receiverId, projectId},
        })

        return worker;
    } catch (error) {
        console.error("Ошибка получения претендента из БД в проекте - ", projectId, receiverId)
    }
}