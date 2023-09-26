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

//get PROJECTS
router.get("/workers/projects", workerController.projects);

module.exports = router