require("dotenv").config();

const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL
})

module.exports = async function getWorkersAll() {
//export const getProjectsAll = async () =>{
    try {
        let response = await $host.get('api/workers/get');
        return response.data;
    } catch (error) {
        console.log("error while calling getWorkersAll api", error.message);
    }
}
