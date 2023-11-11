require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerPretendent(blockId, workerId) {
    try {
        const response = await notion.databases.query({
            database_id: blockId,
            "filter": {
                "property": "4. ФИО",
                "relation": {
                    "contains": workerId
                }
            },
        });

        const worker = response.results.map((page) => {
            return {
                id: page.id,
                fioId: page.properties["4. ФИО"].relation,
            };
        });

        //console.log("response: ", response)

        return worker;
    } catch (error) {
        console.error(error.message)
    }
}