require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addAvatar(pageId, url_image) {

    try {
        const response = await notion.blocks.children.list({
            block_id: pageId,

            page: {
                "image": {
                    "type": "file",
                    "url": url_image,
                },

            },
        })

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}