require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addPassport(passport_str, pageId) {
    try {
        const response = await notion.pages.update({
            //parent: { database_id: databaseWorkersId },
            page_id: pageId,
            properties: {
                Passport: {
                    "type": "rich_text",
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: passport_str,
                            },
                        }
                    ],
                },
                // "Files & media": {
                //     "type": "files",
                //     "files": [
                //         {
                //             "type": "file",
                //             "file": {
                //                 "url": url_image
                //             }
                //         }
                //     ]
                // }
            }
        })

        //console.log(response)

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}