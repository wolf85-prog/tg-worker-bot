require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerNotion(chatId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: chatId,
        });

        const worker = response.results.map((page) => {
            return {
                id: page.id,
                image: page.image ? (page.image?.file ? page.image?.file.url : page.image.external.url) : null,
                //image: page.image,
            };
        });

        return worker;
        //return response;
    } catch (error) {
        console.error(error.message)
    }
}