require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID
const databaseId = process.env.NOTION_DATABASE_ID
const chatTelegramId = process.env.CHAT_ID
const sendMyMessage = require('./../common/sendMyMessage')

//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

//получить данные таблицы Специалисты
async function getWorkers() {
    try {

        let results = []

        let data = await notion.databases.query({
            database_id: databaseWorkerId
        });

        results = [...data.results]

        while(data.has_more) {
            data = await notion.databases.query({
                database_id: databaseWorkerId,
                start_cursor: data.next_cursor,
            }); 

            results = [...results, ...data.results];
        }

        const workers = results.map((page) => {
            return {
                id: page.id,
                fio: page.properties.Name.title[0]?.plain_text,
                tgId: page.properties.Telegram.number,
                phone: page.properties.Phone.phone_number,
                age: page.properties.Age.date,
                city: page.properties.City[0]?.plain_text,
                spec: page.properties.Specialization.multi_select,
            };
        });

        return workers;

    } catch (error) {
        console.error(error.message)
    }
}

async function getWorkers2() {
    try {
        const response = await notion.databases.query({
            database_id: databaseWorkerId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить специалиста по его telegram id
async function getWorkerId(tgId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseWorkerId, 
            "filter": {
                "property": "Telegram",
                "number": {
                    "equals": parseInt(tgId)
                }
            },
            "sorts": [{ 
                "timestamp": "created_time", 
                "direction": "ascending" 
            }]
        });

        const worker = response.results.map((page) => {
            return {
                id: page.id,
                fio: page.properties.Name.title[0]?.plain_text,
                tgId: page.properties.Telegram.number,
                phone: page.properties.Phone.phone_number,
                age: page.properties.Age.date,
                city: page.properties.City.rich_text[0]?.plain_text,
                spec: page.properties.Specialization.multi_select,
                comment: page.properties["Комментарии"].rich_text[0]?.plain_text,
                reyting: page.properties["Рейтинг"].rich_text[0]?.plain_text,
                merch: page.properties.Merch.multi_select,
                comteg: page.properties["КомТег"].multi_select,
                rank: page.properties.Rank.number,

            };
        });

        console.log(worker)

        return worker;
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные дочерних блоков по заданному ID
async function getWorkerChildrenId(blockId) {
    try {

        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        const worker = response.results.map((page) => {
            return {
                id: page.id,
                image: page.image.file.url,
            };
        });

        return worker;
    } catch (error) {
        console.error(error.message)
    }
}

async function sendMessage(chatId) {
    try {
        //отправить сообщение о создании проекта в админ-панель
        const convId = sendMyMessage("Регистрация нового пользователя", "text", chatId)
                
        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
          
         //отправить сообщение в админку
        socket.emit("sendMessageSpec", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: "Регистрация нового пользователя",
            type: 'text',
            convId: convId,
            messageId: '',
        })

        //return response;
    } catch (error) {
        console.error(error.message)
    }
}



async function getProjects() {
    try {

        let results = []

        let data = await notion.databases.query({
            database_id: databaseId
        });

        results = [...data.results]

        while(data.has_more) {
            data = await notion.databases.query({
                database_id: databaseId,
                start_cursor: data.next_cursor,
            }); 

            results = [...results, ...data.results];
        }

        const projects = results.map((page) => {
            return {
                id: page.id,
                title: page.properties.Name.title[0]?.plain_text,
                date: page.properties["Дата"].date,
                status: page.properties["Статус проекта"].select.name,
            };
        });

        return projects;

    } catch (error) {
        console.error(error.message)
    }
}


class WorkerController {

    async workers(req, res) {
        const workers = await getWorkers();
        if(workers){
            res.json(workers);
        }
        else{
            res.json({});
        }
    }

    async workers2(req, res) {
        const workers = await getWorkers2();
        if(workers){
            res.json(workers);
        }
        else{
            res.json({});
        }
    }

    async workerId(req, res) {
        const id = req.params.id; // получаем id
        const worker = await getWorkerId(id);
        if(worker){
            res.json(worker);
        }
        else{
            res.json([]);
        }
    }

    async workerChildrenId(req, res) {
        const id = req.params.id; // получаем id
        const data = await getWorkerChildrenId(id);
        if(data){
            res.json(data);
        }
        else{
            res.json([]);
        }
    }

    async message(req, res) {
        const id = req.params.id; // получаем id
        const mess = await sendMessage(id);
        if(mess){
            res.json(mess);
        }
        else{
            res.json([]);
        }
    }

    async projects(req, res) {
        const projects = await getProjects();
        if(projects){
            res.json(projects);
        }
        else{
            res.json([]);
        }
    }
}

module.exports = new WorkerController()