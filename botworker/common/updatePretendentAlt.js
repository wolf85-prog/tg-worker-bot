require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function updatePretendentAlt(blockId, workerId, stavka, dateNow) {
    try {
        const response = await notion.pages.update({
            parent: { database_id: blockId },
            icon: {
                type: "emoji",
                emoji: "✅"
            },
            page_id: workerId,
            properties: {
                "01. Чек-ин": {
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
                "02. Дата": {
                    type: 'date',                   
                    date: {
                        "start": dateNow,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
            }
        })
        //console.log(response)
        console.log("4.1 Претендент обновлен!. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}