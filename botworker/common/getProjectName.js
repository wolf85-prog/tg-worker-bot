require("dotenv").config();
const {ProjectNew} = require('../models/models')

module.exports = async function getProjectName(id) {
    try {
        const projects = await ProjectNew.findOne({where: {id: parseInt(id)}})
        return projects;

    } catch (error) {
        console.error("Ошибка получения имени проекта ф-и getProjectName())", error.message, new Date().toISOString())
    }

}