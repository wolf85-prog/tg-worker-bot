require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerNotion(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseWorkerId, 
            "filter": {
                "property": "Telegram",
                "number": {
                    "equals": id ? parseInt(id) : 0
                }
            },
            "sorts": [{ 
                "timestamp": "created_time", 
                "direction": "ascending" 
            }]
        });

        const worker = response.results.map((page) => {
            return {
                id: worker.id,
                fio: worker.properties.Name.title[0]?.plain_text,
                tgId: worker.properties.Telegram.number,
                phone: worker.properties.Phone.phone_number,
                age: worker.properties.Age.date,
                city: worker.properties.City.rich_text[0]?.plain_text,
                newcity: worker.properties["Город"].multi_select,
                spec: worker.properties.Specialization.multi_select,
                comment: worker.properties["Комментарии"].rich_text[0]?.plain_text,
                reyting: worker.properties["Рейтинг"].rich_text[0]?.plain_text,
                merch: worker.properties.Merch.multi_select,
                comteg: worker.properties["КомТег"].multi_select,
                rank: worker.properties["Ранг"].number,
                passport: worker.properties.Passport.rich_text[0]?.plain_text,   
                profile: worker.properties["Профиль"], 
            };
        });

        return worker;
    } catch (error) {
        console.error(error.message)
    }
}