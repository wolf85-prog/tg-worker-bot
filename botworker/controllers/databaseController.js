require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

//get items from DB
async function getDatabase() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить пустые данные блока
async function getDatabase2() {
    return {};
}


//получить данные блока по заданному ID
async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.filter((page) => page.properties["02. Дата"].date !== null).map((page) => {
            return {
                date: page.properties["02. Дата"].date?.start,
                fio_id: page.properties["04. ФИО"].relation[0]?.id,
                vid: page.properties["03. Вид работ"]?.multi_select[0]?.name,
                spec: page.properties["05. Специализация"].multi_select[0]?.name                
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}


async function getDatabaseId2(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные блока по заданному ID
async function getDatabaseEquipmentId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
               //id: page.id,
               category: page.properties["Наименование"].multi_select[0]?.name, 
               name: page.properties["Наименование"].multi_select[1]?.name              
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные блока Персональные сметы по заданному ID
async function getDbSmetaId(baseId) {
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
                stavka: page.properties["09. Ставка"].rich_text[0]?.plain_text,   //number
                smena: page.properties["10. Смена"].rich_text[0]?.plain_text,   //number
                pererabotka: page.properties["11. Переработка"].rich_text[0]?.plain_text,   //number    
                taxi: page.properties["12. Такси"].rich_text[0]?.plain_text,   //number
                gsm: page.properties["13. ГСМ"].rich_text[0]?.plain_text,   //number 
                transport: page.properties["14. Транспорт"].rich_text[0]?.plain_text,   //number
                specialist: page.properties["16. Специалист"].rich_text[0]?.plain_text,   //number                
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}


class DatabaseController {

    //специалисты
    async databaseId(req, res) {
        const id = req.params.id; // получаем id

        const base = await getDatabaseId(id);               

        if(base){
            res.json(base);
        }
        else{
            res.json({});
        }
    }

    async databaseId2(req, res) {
        const id = req.params.id; // получаем id
        const base = await getDatabaseId2(id);
    
        if(base){
            res.json(base);
        }
        else{
            res.json({});
        }
    }

    //оборудование
    async databaseEquipmentId(req, res) {
        const id = req.params.id; // получаем id

        const base = await getDatabaseEquipmentId(id);               

        if(base){
            res.json(base);
        }
        else{
            res.json({});
        }
    }

    async database(req, res) {
        const base = await getDatabase2();
        res.json(base);
    }

    async database1(req, res) {
        const projects = await getDatabase();
        res.json(projects);
    }

//сметы
    async dbSmetaId(req, res) {
        const id = req.params.id; // получаем id
        const base = await getDbSmetaId(id);
    
        if(base){
            res.json(base);
        }
        else{
            res.json({});
        }
    }
}

module.exports = new DatabaseController()