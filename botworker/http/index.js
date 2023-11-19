const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})


export {
    $host,
}