const Router = require('express')
const router = new Router()

const workerController = require('../controllers/workerController')

//get WORKERS
router.get("/workers", workerController.workers);
router.get("/workers2", workerController.workers2);
router.get("/workers/:id", workerController.workerId);

router.get('/workers/children/:id', workerController.workerChildrenId); // получить данные дочерних блоков

//SEND MESSAGE
router.get("/sendmessage/:id", workerController.message);

//get PROJECTS ALL
router.get("/projectall", workerController.projectAll);

//get PROJECTS NEW
router.get("/projectsnew", workerController.projectsNew);

//get PROJECTS STATUS
router.get("/projectsold", workerController.projectsOld);


//get DATABASE (специалисты)
router.get('/database/:id', databaseController.databaseId); //получить список работников
router.get('/database2/:id', databaseController.databaseId2);
router.get('/database/', databaseController.database);
router.get("/database1", databaseController.database1);

//get BLOCK (специалисты)
router.get('/blocks/:id', blockController.blocksId); //получить id таблицы/блока "Основной состав" ("4a74b62a-2f46-4fae-9e4b-9c700cb1b2f1")
router.get('/blocksp/:id', blockController.blocksPId); //получить id таблицы/блока "Претенденты"
router.get('/blocks2/:id', blockController.blocksId2); //подробная инфа
router.get('/block/:id', blockController.blockId); // получить данные доп. таблиц

module.exports = router