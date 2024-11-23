require("dotenv").config();
const {ProjectNew} = require('../models/models')

module.exports = async function getProjectName(id) {
    try {
        const projects = await ProjectNew.findOne({where: {projectId: id}})
        return res.status(200).json(projects);

    } catch (error) {
        console.error("Ошибка получения имени проекта ф-и getProjectName())", error.message, new Date().toISOString())
    }

}