require("dotenv").config();
const { Client } = require("@notionhq/client");
const getBlocksNew = require("../common/getBlocksNew");
const getDatabaseSmeta = require("../common/getDatabaseSmeta");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseSmetaId = process.env.NOTION_DATABASE_SMETA_ID
const {Speccash, Smetacash} = require('../models/models')

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
                final: page.properties["Финал. смета"].status.name,
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

//получить сметы из БД (кэш)
async function getSmetsCash() {
    try {
        const smets = await Smetacash.findAll({
            order: [
                ['id', 'DESC'],
            ],
        })
        return smets;
    } catch (error) {
        console.error(error.message);
    }
}

//update stavka
async function addStavka(id, projId, stavka) {
    try {
        // First try to find the record
        const foundItem = await Speccash.findOne({ where: {specId: id, projectId: projId} });
        //console.log(foundItem)

        if (!foundItem) {
            // Item not found, create a new one
            const newStavka = await Speccash.create({specId: id, projectId: projId, predStavka: stavka})
            return newStavka;
        }

        // Found an item, update it
        const item = await Speccash.update({predStavka: stavka},{where: {specId: id, projectId: projId}});

        return item;
    } catch (error) {
        console.error(error.message);
    }
}

//update stavka
async function addFactStavka(id, projId, stavka) {
    try {
        // First try to find the record
        const foundItem = await Speccash.findOne({ where: {specId: id, projectId: projId} });
        //console.log(foundItem)

        if (!foundItem) {
            // Item not found, create a new one
            const newStavka = await Speccash.create({specId: id, projectId: projId, factStavka: stavka})
            return newStavka;
        }

        // Found an item, update it
        const item = await Speccash.update({factStavka: stavka},{where: {specId: id, projectId: projId}});

        return item;
    } catch (error) {
        console.error(error.message);
    }
}

//get stavka
async function getSpecStavka(id, projId) {
    try {
        const foundItem = await Speccash.findOne({ where: {specId: id, projectId: projId} });

        return foundItem;
    } catch (error) {
        console.error(error.message);
    }
}

class SmetaController {

    async predStavka(req, res) {
        const id = req.params.id; // получаем id
        const projId = req.params.projid; // получаем id
        const stavka = req.params.stavka; // получаем id
        const stavka2 = await addStavka(id, projId, stavka);
        res.json(stavka2);
    }

    async factStavka(req, res) {
        const id = req.params.id; // получаем id
        const projId = req.params.projid; // получаем id
        const stavka = req.params.fact; // получаем id
        const stavka2 = await addFactStavka(id, projId, stavka);
        res.json(stavka2);
    }

    async specStavka(req, res) {
        const id = req.params.id; // получаем id
        const projid = req.params.projid; // получаем id
        const spec = await getSpecStavka(id, projid);
        res.json(spec);
    }
    
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
                const blockId = await getBlocksNew(smeta.id, "Персональные сметы");
                if (blockId) {  
                    //console.log("blockId: ", blockId)
                    databaseBlock = await getDatabaseSmeta(blockId); 
                    //console.log(JSON.stringify(databaseBlock))
                    //если бд ноушена доступна
                    if (databaseBlock) {
                        databaseBlock.map((db) => {
                            if (db.fio_id) {
                                const newPerson = {
                                    fio_id: db?.fio_id,
                                    start: db?.start,
                                    stop: db?.stop,
                                    chasi: db?.chasi,
                                    stavka: db?.stavka,
                                    smena: db?.smena,
                                    pererabotka: db?.pererabotka,
                                    taxi: db?.taxi,
                                    gsm: db?.gsm,
                                    transport: db?.transport,
                                    specialist: db?.specialist,
                                }
                                arrayPerson.push(newPerson)
                            }
                        })

                        const newSmeta = {
                            id: smeta.id,
                            title: smeta.name,
                            projectId: smeta.projectId,
                            final: smeta.final,
                            dop: arrayPerson
                        }
                        arraySmeta.push(newSmeta)                           
                    }                   
                } else {
                    console.log("База данных не найдена! Смета ID: " + smeta.title)
                }
            })

            //res.json(arrayProject);
            setTimeout(()=> {
                res.json(arraySmeta);
            }, 10000) 
        }
        else{
            res.json([]);
        }
    }



    async smetsCash(req, res) {
        const smets = await getSmetsCash();
        if(smets){
            res.json(smets);
        }
        else{
            res.json({});
        }
    }

}

module.exports = new SmetaController()