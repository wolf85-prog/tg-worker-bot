require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addAvatar(pageId, url_image) {

    try {
        const response = await notion.blocks.children.append({
            block_id: pageId,
        
            children: [ 
                {
                    image: {
                        "type": "external",
                        "external": {
                            "url": url_image,
                        }
                    }
                }
            ]
        });

        return response;

    } catch (error) {
        console.error(error.message)
    }
}