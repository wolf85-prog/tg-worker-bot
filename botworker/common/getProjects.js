require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

const getBlocks = require("../common/getBlocks");
const getDatabaseId = require("../common/getDatabaseId");

module.exports = async function getProjects() {
    let databaseBlock;
    let arrayProject = []
    let responseResults

    console.log("start get projects...")
    try {
        //1
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 30,
        });

        responseResults = response.results.map((page) => {
            return {
                id: page.id,
                title: page.properties.Name.title[0]?.plain_text,
                date_start: page.properties["Дата"].date?.start,
                date_end: page.properties["Дата"].date?.end,
                status: page.properties["Статус проекта"].select,
            };
        });

        console.log(responseResults)
        //return responseResults;

    } catch (error) {
        console.error(error.message)
    }

    //const projects = await getProjects();
    if (responseResults && responseResults.length > 0){
        responseResults.map(async(project, index)=> {
            let arraySpec = []
            const blockId = await getBlocks(project.id);
            if (blockId) {  
                databaseBlock = await getDatabaseId(blockId); 
                //если бд ноушена доступна
                if (databaseBlock) {
                    databaseBlock.map((db) => {
                        if (db.fio_id) {
                            const newSpec = {
                                id: db?.fio_id,
                                vid: db?.vid,
                                spec: db?.spec,
                                date: db?.date,
                            }
                            arraySpec.push(newSpec)
                        }
                    })

                    const newProject = {
                        id: project.id,
                        title: project.title,
                        date_start: project.date_start,
                        date_end: project.date_end,
                        status: project.status,
                        specs: arraySpec,
                    }
                    arrayProject.push(newProject)                           
                }                   
            } else {
                console.log("База данных не найдена! Проект ID: " + project.title)
            }
            
        })

        setTimeout(()=> {
           return arrayProject;
        }, 10000) 
    } else {
        return arrayProject;
    }
}