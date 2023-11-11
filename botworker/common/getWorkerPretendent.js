require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID

//получить id блока заданной страницы по tg_id
module.exports = async function getWorkerPretendent(blockId, workerId) {
    try {
        const response = await notion.databases.query({
            page_id: blockId,
            "filter": {
                "property": "4. ФИО",
                "relation": {
                    "contains": workerId
                }
            },
        });

        // const worker = response.results.map((page) => {
        //     return {
        //         id: page.id,
        //         fio: page.properties.Name.title[0]?.plain_text,
        //         tgId: page.properties.Telegram.number,
        //         phone: page.properties.Phone.phone_number,
        //         age: page.properties.Age.date,
        //         city: page.properties.City.rich_text[0]?.plain_text,
        //         spec: page.properties.Specialization.multi_select,
        //         comment: page.properties["Комментарии"].rich_text[0]?.plain_text,
        //         reyting: page.properties["Рейтинг"].rich_text[0]?.plain_text,
        //         merch: page.properties.Merch.multi_select,
        //         comteg: page.properties["КомТег"].multi_select,
        //         rank: page.properties.Rank.number,
        //         passport: page.properties.Passport.rich_text[0]?.plain_text,
        //     };
        // });

        console.log("response: ", response)

        return response;
    } catch (error) {
        console.error(error.message)
    }
}