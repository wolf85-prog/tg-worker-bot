require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить id блока заданной страницы по id
module.exports = async function getWorkerNotion(chatId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseWorkerId, 
            "filter": {
                "property": "Telegram",
                "number": {
                    "equals": parseInt(chatId)
                }
            },
            "sorts": [{ 
                "timestamp": "created_time", 
                "direction": "ascending" 
            }]
        });

        const worker = response.results.map((page) => {
            return {
                id: page.id,
                fio: page.properties.Name.title[0]?.plain_text,
                tgId: page.properties.Telegram.number,
                phone: page.properties.Phone.phone_number,
                age: page.properties.Age.date,
                city: page.properties.City.rich_text[0]?.plain_text,
                spec: page.properties.Specialization.multi_select,
            };
        });

        return worker;
    } catch (error) {
        console.error(error.message)
    }
}