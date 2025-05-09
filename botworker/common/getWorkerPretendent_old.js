require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerPretendent_old(blockId, workerId, projectName) {
    try {
        const response = await notion.databases.query({
            database_id: blockId,
            "filter": {
                "property": "04. ФИО",
                "relation": {
                    "contains": workerId
                }
            },
        });

        //console.log("response: ", JSON.stringify(response))

        const worker = response.results.map((page) => {
            return {
                id: page.id,
                //fioId: page.properties["4. ФИО"].relation,
                status: page.properties["03. Статус"].select?.name,
            };
        });

        return worker;
    } catch (error) {
        console.error("Ошибка получения претендента из Ноушена в проекте - ", projectName, workerId)
    }
}