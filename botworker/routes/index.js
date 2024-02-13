const Router = require('express')
const router = new Router()

const workerController = require('../controllers/workerController')
const databaseController = require('../controllers/databaseController')
const blockController = require('../controllers/blockController')
const projectController = require('../controllers/projectController')
const smetaController = require('../controllers/smetaController')

//get WORKERS
router.get("/workers", workerController.workers);
router.get("/workers2", workerController.workers2);
router.get("/workers/:id", workerController.workerId);
router.get("/workers/chat/:id", workerController.workersChatId);

router.get('/workers/children/:id', workerController.workerChildrenId); // получить данные дочерних блоков

//SEND MESSAGE
router.get("/sendmessage/:id", workerController.message);

//get PROJECTS ALL
router.get("/projectall", workerController.projectAll);

//get PROJECTS NEW
router.get("/projectsnew", workerController.projectsNew);

//get PROJECTS STATUS
router.get("/projectsold", workerController.projectsOld);

router.get("/project/:id", projectController.projectId);

router.get("/projectscash", projectController.projectsCash)


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

//get Pretendent from project
router.get("/pretendents/:projectId", workerController.pretendents);

//-----------------СМЕТЫ-------------------------
//get SMETS 
router.get('/smeta', smetaController.smeta) //все сметы с краткой информацией
router.get('/smeta/all', smetaController.smetaAll) //все сметы с полной информацией
router.get('/smeta/:id', smetaController.smetaId) // одна смета по id проекта

router.get('/smetsall', smetaController.smetsAll) //все сметы с дополнительной информацией

router.get("/smetscash", smetaController.smetsCash) //кеш всех смет в БД

router.get("/specs/stavka/add/:id/:projid/:stavka/:date", smetaController.predStavka) //добавить вкеш специалиста с его ставкой
router.get("/specs/stavka/get/:id/:projid/:date", smetaController.specStavka) //получить кеш специалиста с его ставкой на дату
router.get("/specs/stavka/fact/:id/:projid/:fact/:date", smetaController.factStavka) //добавить в кеш ставку фактическую

//get BLOCK (сметы)
router.get('/blockssmeta/:id', blockController.blocksSmetaId); //получить id таблицы/блока "Персональные сметы"

//get DATABASE (специалисты)
router.get('/dbsmeta/:id', databaseController.dbSmetaId); //получить таблицу Персональные сметы

module.exports = router