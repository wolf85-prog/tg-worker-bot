require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить данные таблицы Специалисты
async function getWorkers() {
    try {
        const response = await notion.databases.query({
            database_id: databaseWorkerId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               fio: page.properties.Name.title[0]?.plain_text,
               tgId: page.properties.Telegram.number,
               phone: page.properties.Phone.phone_number,
               age: page.properties.Age.date,
               city: page.properties.City.rich_text,
            };
        });

        //console.log(responseResults);
        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}

async function getWorkers2() {
    try {
        const response = await notion.databases.query({
            database_id: databaseWorkerId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}


class WorkerController {

    async workers(req, res) {
        const workers = await getWorkers();
        if(workers){
            res.json(workers);
        }
        else{
            res.json({});
        }
    }

    async workers2(req, res) {
        const workers = await getWorkers2();
        if(workers){
            res.json(workers);
        }
        else{
            res.json({});
        }
    }
}

module.exports = new WorkerController()