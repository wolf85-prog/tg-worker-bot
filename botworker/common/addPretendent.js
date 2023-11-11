require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
//const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

//send data to notion
module.exports = async function addPretendent(blockId, workerId, stavka) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            // icon: {
            //     type: "emoji",
            //     emoji: "➡️"
            // },
            properties: {
                "1. Ставка": {
                    type: "title",
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: stavka ? stavka : "",
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": stavka ? stavka: "",
                            "href": null
                        }
                    ],
                },
                // "2. Тех. Задание": {
                //     type: 'rich_text',   
                //     rich_text: [
                //         {
                //             "type": "text",
                //             "text": {
                //                 "content": "Техническое Задание текстом подробно",
                //             },                           
                //         }
                //     ]
                // },
                "3. Дата": {
                    type: 'date',                   
                    date: {
                        "start": dateNow,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                "4. ФИО": {
                    type: "relation",
                    relation: [
                        {
                            "id": workerId
                        }
                    ]
                },
            }
        })
        //console.log(response)
        console.log("4.1 Претендент добавлен!. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}