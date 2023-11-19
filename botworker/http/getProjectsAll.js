require("dotenv").config();

const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

module.exports = async function getProjectsAll() {
//export const getProjectsAll = async () =>{
    try {
       let response = await $host.get(`api/projectall`);
       //console.log(response);
       return response.data;
    } catch (error) {
        console.log("error while calling getProjectAll api", error.message);
    }
}
