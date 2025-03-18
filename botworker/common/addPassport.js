require("dotenv").config();
const {Specialist} = require('../models/models');

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addPassport(passport_str, pageId) {
    try {
        // const response = await notion.pages.update({
        //     page_id: pageId,
        //     properties: {
        //         Passport: {
        //             "type": "rich_text",
        //             rich_text: [
        //                 {
        //                     type: 'text',
        //                     text: {
        //                         content: passport_str,
        //                     },
        //                 }
        //             ],
        //         },
        //     }
        // })

        //сохранение паспорт
        const response = await Specialist.update({
                passport: passport_str
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