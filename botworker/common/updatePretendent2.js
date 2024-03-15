require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();

//send data to notion
module.exports = async function updatePretendent2(pageId) {
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            archived: true,
        })
        //console.log(response)
        if (response) {
            console.log("Претендент обновлен!") //+ JSON.stringify(response))
        } else {
            console.log("Ошибка обновления претендента!") //+ JSON.stringify(response))
        }
    } catch (error) {
        console.error(error.message)
    }
}