require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
//const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

//send data to notion
module.exports = async function updatePretendent(blockId, workerId, stavka) {
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
                                content: "➡️" + stavka + " руб/час * 0 — 0 часов",
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": "➡️" + stavka + " руб/час * 0 — 0 часов",
                            "href": null
                        }
                    ],
                },
            }
        })
        //console.log(response)
        console.log("4.1 Претендент добавлен!. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}