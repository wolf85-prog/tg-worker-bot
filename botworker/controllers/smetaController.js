require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseSmetaId = process.env.NOTION_DATABASE_SMETA_ID

async function getSmeta() {
    try {
        const response = await notion.databases.query({
            database_id: databaseSmetaId
        });

        const responseResults = response.results.map((page) => {
            return {
                id: page.id,
                projectId: page.properties["Проект"].relation[0]?.id,
                name: page.properties.Name.title[0]?.plain_text,
                // final: page.properties["Финал. смета"].status.id,
                // pre: page.properties["Пред. смета"].status.id,
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}

async function getSmetaAll() {
    try {
        const response = await notion.databases.query({
            database_id: databaseSmetaId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить id сметы (страницы)
async function getSmetaId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseSmetaId, 
            "filter": {
                "property": "Проект",
                "relation": {
                    "contains": id
                }
            }
        });
        console.log("SmetaId: ", response.results[0].id)
        return response.results[0].id;
    } catch (error) {
        console.error(error.message)
    }
}

class SmetaController {
    
    async smeta(req, res) {
        const smeta = await getSmeta();
        res.json(smeta);
    }

    async smetaAll(req, res) {
        const smeta = await getSmetaAll();
        res.json(smeta);
    }

    async smetaId(req, res) {
        const id = req.params.id; // получаем id
        const page = await getSmetaId(id);
        res.json(page);
    }


    async smetsAll(req, res) {
        let databaseBlock;
        let arraySmeta = []

        const smets = await getSmeta();
        if (smets && smets.length > 0){
            smets.map(async(smeta, index)=> {
                let arrayPerson = []
                const blockId = await getBlocks(project.id);
                if (blockId) {  
                    //console.log("blockId: ", blockId)
                    databaseBlock = await getDatabaseId(blockId); 
                    //console.log(JSON.stringify(databaseBlock))
                    //если бд ноушена доступна
                    if (databaseBlock) {
                        databaseBlock.map((db) => {
                            if (db.fio_id) {
                                const newPerson = {
                                    id: db?.fio_id,
                                    vid: db?.vid,
                                    spec: db?.spec,
                                    date: db?.date,
                                }
                                arrayPerson.push(newPerson)
                            }
                        })

                        const newSmeta = {
                            id: smeta.id,
                            title: smeta.title,
                            date_start: smeta.date_start,
                            date_end: smeta.date_end,
                            status: smeta.status,
                            specs: arraySpec,
                        }
                        arraySmeta.push(newSmeta)                           
                    }                   
                } else {
                    console.log("База данных не найдена! Смета ID: " + smeta.title)
                }
                
                // if (index === project.length-1) {
                //     setTimeout(()=> {
                //         res.json(arrayProject);
                //     }, 5000)     
                // }
            })

            //res.json(arrayProject);
            setTimeout(()=> {
                res.json(arrayProject);
            }, 10000) 
        }
        else{
            res.json([]);
        }
    }

}

module.exports = new SmetaController()