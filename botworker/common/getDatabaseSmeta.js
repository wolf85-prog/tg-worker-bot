require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function getDatabaseSmeta(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
                fio_id: page.properties["04. ФИО"].relation[0]?.id,
                start: page.properties["06. Старт"].rich_text[0]?.plain_text,
                stop: page.properties["07. Стоп"].rich_text[0]?.plain_text, 
                chasi: page.properties["08. Часы"].rich_text[0]?.plain_text, 
                stavka: page.properties["09. Ставка"].number,   
                smena: page.properties["10. Смена"].number,
                pererabotka: page.properties["11. Переработка"].number,     
                taxi: page.properties["12. Такси"].number, 
                gsm: page.properties["13. ГСМ"].number,  
                transport: page.properties["14. Транспорт"].number,   
                specialist: page.properties["16. Специалист"].number,             
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}