require("dotenv").config();
const databaseId = process.env.NOTION_DATABASE_ID

module.exports = async function addWorker(title, tg_id, age, phone, worklist, citylist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                // City: {
                //     "type": "rich_text",
                //     "rich_text": citylist
                // },
                // Phone: {
                //     "type": "phone_number",
                //     "phone_number": phone
                // },
                // Age: {
                //     "type": "date",
                //     "date": age
                // },
                // Specialization: {
                //     "type": "multi_select",
                //     "multi_select": worklist
                // },
                // Telegram: {
                //     "type": "number",
                //     "number": tg_id
                // },
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                }
            }
        })

        console.log(response)

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}