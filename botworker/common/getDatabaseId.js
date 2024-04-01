require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.filter((page) => page.properties["02. Дата"].date !== null).map((page) => {
            return {
                id: page.id,
                date: page.properties["02. Дата"].date?.start,
                fio_id: page.properties["04. ФИО"].relation[0]?.id,
                vid: page.properties["03. Вид работ"] ? page.properties["03. Вид работ"].multi_select[0]?.name : page.properties["03. Статус"].multi_select[0]?.name,
                spec: page.properties["05. Специализация"].multi_select[0]?.name                
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}