require("dotenv").config();
const sequelize = require('../connections/db')
const {Pretendent} = require('../models/models')

// текущая дата
const dateNow = new Date();

//send data to notion
module.exports = async function updatePretendent(pageId) {
    try {
        let exist=await Pretendent.findOne( {where: {id: pageId}} )
            
        if(!exist){
            return;
        }

        const {
            status,
        } = req.body

        const response = await Pretendent.update(
            { 
                status,
            },
        { where: {id: id} })

        //console.log(response)
        if (response) {
            console.log("Претендент обновлен!") //+ JSON.stringify(response))
        } else {
            console.log("Ошибка обновления претендента!") //+ JSON.stringify(response))
        }
    } catch (error) {
        console.error(error.message)
    }
}