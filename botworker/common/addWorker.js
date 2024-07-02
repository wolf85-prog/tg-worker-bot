require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addWorker(title, tg_id, age, phone, worklist, citylist, promoId, url_image) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseWorkersId },
            properties: {
                // City: {
                //     "type": "rich_text",
                //     rich_text: [
                //         {
                //             type: 'text',
                //             text: {
                //                 content: citylist,
                //             },
                //         }
                //     ],
                // },
                "Город": {
                     "multi_select": [
                            {
                              "name": citylist,  
                            }
                            
                    ]
                },
                Phone: {
                    "type": "phone_number",
                    "phone_number": phone
                },
                Age: {
                    "type": "date",
                    date: {
                        "start": age,
                        "end": null,
                    }
                },
                Specialization: {
                    "type": "multi_select",
                    "multi_select": worklist
                },
                Telegram: {
                    "type": "number",
                    "number": tg_id
                },
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                "Промокод ID": {
                    "type": "number",
                    "number": promoId
                },
                "Профиль": {
                    "type": "files",
                    "files": [
                        {
                            "name": 'image_'+ new Date().toISOString()+'.jpg',
                            "type": "external",
                            "external": {
                                "url": url_image,
                            }
                        }
                    ]
                },
            }
        })

        //console.log(response)

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error("Ошибка добавления специалиста в Notion: ")
        console.error(error.message)
    }
}