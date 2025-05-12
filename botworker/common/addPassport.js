require("dotenv").config();
const {Specialist} = require('../models/models');

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addPassport(passport_str, pageId, pasFam, pasName, pasSoname, pasNumber, pasDateborn, pasKem, pasDate, pasKod, pasPlaceborn, pasAdress) {
    try {

        //сохранение паспорт
        const response = await Specialist.update({
                passport: passport_str,
                age: pasDateborn ? pasDateborn.split('.')[2] +'-'+ pasDateborn.split('.')[1] +'-'+ pasDateborn.split('.')[0] : '',
                passeria: pasNumber ? pasNumber.split(' ')[0] : '',
                pasnumber: pasNumber ? pasNumber.split(' ')[1] : '',
                paskemvidan: pasKem,
                pasdatevidan: pasDate,
                pascode: pasKod,
                pasbornplace: pasPlaceborn,
                pasaddress: pasAdress,
                surname: pasFam,
                name: pasName,
                secondname: pasSoname,
            },
            {
                where: {id: parseInt(pageId)}
            })

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error("Ошибка добавления паспорта ф-и addPassport())", error.message)
    }
}