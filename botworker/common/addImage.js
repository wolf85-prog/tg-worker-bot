require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addImage(url_image, pageId) {

    console.log(
                    {
                        "url": url_image,
                    },)
    try {
        const response = await notion.pages.update({
            //parent: { database_id: databaseWorkersId },
            page_id: pageId,
            properties: {
                "Files & media": {
                    "type": "files",
                    "files": [
                        {
                            "name": "sfsdfsdfsdfsdf.png",
                            "external": "gdfgdfgdfg.png",
                            "type": "file",
                            "file": {
                                "url": url_image,
                                "expiry_time": "2022-12-15T01:20:12.928Z"
                            },
                        },
                    ],
                },
                // "Комментарии": {
                //     "type": "rich_text",
                //     rich_text: [
                //         {
                //             type: 'text',
                //             text: {
                //                 content: "ssdfsdf",
                //             },
                //         }
                //     ],
                // },
            },
        })

        console.log(response)

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}