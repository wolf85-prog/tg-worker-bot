const Router = require('express')
const router = new Router()

const workerController = require('../controllers/workerController')

//get WORKERS
router.get("/workers", workerController.workers);
router.get("/workers2", workerController.workers2);
router.get("/workers/:id", workerController.workerId);

//SEND MESSAGE
router.get("/sendmessage", workerController.message);

module.exports = router