require("dotenv").config();

const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

//получить id блока заданной страницы по id
module.exports = async function getProjectNew() {

    try {
        let response = await $host.get(`api/projectnewdate`);
        //console.log(response);
        return response.data;
    } catch (error) {
        console.log("error while calling getProjectNew api", error.message);
    }
}