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
                            "type": "external",
                            "external": {
                                "url": url_image,
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