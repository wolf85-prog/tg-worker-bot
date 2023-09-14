const Router = require('express')
const router = new Router()

const workerController = require('../controllers/workerController')

//get WORKERS
router.get("/workers", workerController.workers);

module.exports = router