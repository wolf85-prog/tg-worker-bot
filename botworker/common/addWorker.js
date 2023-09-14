require("dotenv").config();
const databaseId = process.env.NOTION_DATABASE_ID

module.exports = async function addWorker(title, time, teh, managerId, companyId, worklist, geoId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                
            }
        })

        console.log(response)
        
        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}