require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function getProjectName(projectId) {
    try {
        const response = await notion.pages.retrieve({
            page_id: projectId,           
        });

        //title: response.properties.Name.title[0]?.plain_text,  

        return response;
    } catch (error) {
        console.error("Ошибка получения имени проекта ф-и getProjectName())", error.message)
    }

}