require("dotenv").config();
const {Specialist} = require('../models/models')
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkerId = process.env.NOTION_DATABASE_WORKERS_ID
const databaseId = process.env.NOTION_DATABASE_ID
const chatTelegramId = process.env.CHAT_ID
const sendMyMessage = require('./../common/sendMyMessage')

const getBlocks = require("../common/getBlocks");
const getDatabaseId = require("../common/getDatabaseId");

//socket.io
const {io} = require("socket.io-client");
const socketUrl = process.env.SOCKET_APP_URL

//получить данные таблицы Специалисты
async function getWorkers() {
    try {

        // let results = []

        // let data = await notion.databases.query({
        //     database_id: databaseWorkerId
        // });

        // results = [...data.results]

        // while(data.has_more) {
        //     data = await notion.databases.query({
        //         database_id: databaseWorkerId,
        //         start_cursor: data.next_cursor,
        //     }); 

        //     results = [...results, ...data.results];
        // }

        // const workers = results.map((page) => {
        //     return {
        //         id: page.id,
        //         fio: page.properties.Name.title[0]?.plain_text,
        //         tgId: page.properties.Telegram.number,
        //         phone: page.properties.Phone.phone_number,
        //         age: page.properties.Age.date,
        //         city: page.properties.City[0]?.plain_text,
        //         spec: page.properties.Specialization.multi_select,
        //         comment: page.properties["Комментарии"].rich_text[0]?.plain_text,
        //         reyting: page.properties["Рейтинг"].rich_text[0]?.plain_text,
        //         merch: page.properties.Merch.multi_select,
        //         comteg: page.properties["КомТег"].multi_select,
        //         rank: page.properties["Ранг"].number,
        //         passport: page.properties.Passport.rich_text[0]?.plain_text,
        //         skill: page.properties.Skill.multi_select,
        //         profile: page.properties["Профиль"],
        //     };
        // });

        return null;

    } catch (error) {
        console.error(error.message, new Date().toLocaleDateString())
    }
}

//получить данные таблицы Специалисты
async function getWorkers100(id) {
    
}

async function getWorkers2() {
    // try {
    //     const response = await notion.databases.query({
    //         database_id: databaseWorkerId
    //     });

    //     return response;
    // } catch (error) {
    //     console.error(error.message)
    // }
}

//получить специалиста по его telegram id
async function getWorkerId(id) {
    console.log("Открытие приложения Workhub: ", id, new Date().toLocaleDateString())
    try {
        //сохранение сообщения в базе данных wmessage
        const workerId = await Specialist.findOne({where: {chatId: id.toString()}})

        return workerId;
       
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные дочерних блоков по заданному ID
async function getWorkerChildrenId(pageId) {
    try {

        // const response = await notion.blocks.children.list({
        //     block_id: pageId,
        // });

        // const worker = response.results.map((page) => {
        //     return {
        //         id: page.id,
        //         image: page.image ? (page.image?.file ? page.image?.file.url : page.image.external.url) : null, //page.image?.file ? page.image?.file.url : page.image.external.url,
        //     };
        // });

        // return worker;
    } catch (error) {
        console.error(error.message)
    }
}

//получить специалиста по его telegram id
async function getWorkerInfoId(id) {
    
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
        //1
        // const response = await notion.databases.query({
        //     database_id: databaseId,
        //     //page_size: 30,
        //     "filter": 
        //     {
        //         "timestamp": "created_time",
        //         "created_time": {
        //             "after": "2023-09-30"
        //         }
        //     }
        // });

        // const responseResults = response.results.map((page) => {
        //     return {
        //         id: page.id,
        //         title: page.properties.Name.title[0]?.plain_text,
        //         date_start: page.properties["Дата"].date?.start,
        //         date_end: page.properties["Дата"].date?.end,
        //         status: page.properties["Статус проекта"].select,
        //         tgURL_chat: page.properties.TG_URL_chat.rich_text[0]?.plain_text,
        //         manager: page.properties["Менеджер"].relation[0]?.id,
        //     };
        // });

        
        // return responseResults;

    } catch (error) {
        console.error(error.message)
    }
}

async function getProjectNew() {
    try {
        // const response = await notion.databases.query({
        //     database_id: databaseId,
        //     "filter": {
        //         "or": [
        //             {
        //                 "property": "Статус проекта",
        //                 "select": {
        //                     "equals": "Ready"
        //                 }
        //             },
        //             {
        //                 "property": "Статус проекта",
        //                 "select": {
        //                     "equals": "Load"
        //                 }
        //             },
        //             {
        //                 "property": "Статус проекта",
        //                 "select": {
        //                     "equals": "OnAir"
        //                 }
        //             }
        //             // {
        //             //     // "property": "Date",
        //             //     // "date": {
        //             //     //     "after": "2023-05-31"
        //             //     // }
        //             //     "timestamp": "created_time",
        //             //     "created_time": {
        //             //         "after": "2023-05-31"
        //             //     }
        //             // }
        //         ]
                
        //     },
        // });

        // const responseResults = response.results.map((page) => {
        //     return {
        //         id: page.id,
        //         title: page.properties.Name.title[0]?.plain_text,
        //         date_start: page.properties["Дата"].date?.start,
        //         date_end: page.properties["Дата"].date?.end,
        //         status: page.properties["Статус проекта"].select,
        //     };
        // });

        // return responseResults;

    } catch (error) {
        console.error(error.message)
    }
}


async function getProjectOld() {
    try {

        // const response = await notion.databases.query({
        //     database_id: databaseId,
        //     "filter": {
        //         "or": [
        //             {
        //                 "property": "Статус проекта",
        //                 "select": {
        //                     "equal": "Wasted"
        //                 }
        //             },
        //             {
        //                 "property": "Статус проекта",
        //                 "select": {
        //                     "equal": "Done"
        //                 }
        //             },
        //         ],            
        //     },
        // });

        // const responseResults = response.results.map((page) => {
        //     return {
        //         id: page.id,
        //         title: page.properties.Name.title[0]?.plain_text,
        //         date_start: page.properties["Дата"].date?.start,
        //         date_end: page.properties["Дата"].date?.end,
        //         status: page.properties["Статус проекта"].select,
        //     };
        // });

        // return responseResults;

    } catch (error) {
        console.error(error.message)
    }
}


async function getPretendents(id) {
    try {

        // const response = await notion.databases.query({
        //     database_id: id,
        // });

        // const responseResults = response.results.map((page) => {
        //     return {
        //         id: page.id,
        //         fioId: page.properties["4. ФИО"].relation,
        //     };
        // });

        // return responseResults;

    } catch (error) {
        console.error(error.message)
    }
}

//получить id менеджера по его TelegramID
async function getWorkerChatId(id) {
    console.log("chat worker: ", id)
    try {
        // const response = await notion.databases.query({
        //     database_id: databaseWorkerId, 
        //     "filter": {
        //         "property": "Telegram",
        //         "number": {
        //             "equals": id ? parseInt(id) : 0
        //         },
        //     }
        // });

        // return response.results[0]?.id; 
        
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

    async workers100(req, res) {
        const id = req.params.id; // получаем id
        const workers = await getWorkers100(id);
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

    async workerInfoId(req, res) {
        const id = req.params.id; // получаем id
        const worker = await getWorkerInfoId(id);
        if(worker){
            res.json(worker);
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

    async projectAll(req, res) {
        let databaseBlock;
        let arrayProject = []

        const projects = await getProjects();
        if (projects && projects.length > 0){
            projects.map(async(project, index)=> {
                let arraySpec = []
                const blockId = await getBlocks(project.id);
                if (blockId) {  
                    //console.log("blockId: ", blockId)
                    databaseBlock = await getDatabaseId(blockId); 
                    //console.log(JSON.stringify(databaseBlock))
                    //если бд ноушена доступна
                    if (databaseBlock) {
                        databaseBlock.map((db) => {
                            if (db.id) {
                                const newSpec = {
                                    rowId: db?.id,
                                    id: db?.fio,
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
                            tgURL_chat: project.tgURL_chat,
                            managerId: project.manager,
                            specs: arraySpec,
                        }
                        arrayProject.push(newProject)                           
                    }                   
                } else {
                    console.log("База данных не найдена! Проект ID: " + project.title)
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

    async projectsNew(req, res) {
        const projects = await getProjectNew();
        if(projects){
            res.json(projects);
        }
        else{
            res.json([]);
        }
    }

    async projectsOld(req, res) {
        const projects = await getProjectOld();
        if(projects){
            res.json(projects);
        }
        else{
            res.json([]);
        }
    }

    async pretendents(req, res) {
        const id = req.params.projectId; // получаем id
        const pretendents = await getPretendents(id);
        if(pretendents){
            res.json(pretendents);
        }
        else{
            res.json([]);
        }
    }

    async workersChatId(req, res) {
        const id = req.params.id; // получаем id
        const worker = await getWorkerChatId(id);
        if(worker){
            res.json(worker);
        }
        else{
            res.json({});
        }
    }
}

module.exports = new WorkerController()