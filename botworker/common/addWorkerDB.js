require("dotenv").config();
const {Specialist} = require('./botworker/models/models');

module.exports = async function addWorkerDB(title, tg_id, age, worklist, city, promoId, url_image) {
    try {
        
        const user = {
            fio: title,
            chatId: tg_id,
            specialization: JSON.stringify(worklist),  
            city: city,
            promoId: promoId,  
            age: age,
            profile: url_image,
        }
        //сохранение сообщения в базе данных wmessage
        await Specialist.create(user)

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error("Ошибка добавления специалиста: ")
        console.error(error.message)
    }
}