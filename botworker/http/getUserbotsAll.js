require("dotenv").config();

const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL
})

module.exports = async function getUserbotsAll() {
        try {
            let response = await $host.get('api/userbots/get');
            return response.data;
        } catch (error) {
            console.log("error while calling getUserbotsAll api", error.message);
        }
    }
