require("dotenv").config();

const axios = require("axios");

const $host_stavka = axios.create({
    baseURL: process.env.REACT_APP_API_URL_STAVKA
})

// const headers = {};

// const httpsAgent = new https.Agent({
//   ca: fs.readFileSync('./certs/cert.pem'),
//   cert: fs.readFileSync('./certs/cert.pem'),
// })

//const data = await axios.get(url, { httpsAgent, headers })

module.exports = async function getStavka(projectId, staffId) {
//export const getStavka = async (projectId, staffId) =>{
    try {
       let response = await $host_stavka.get(`pre-payment/${projectId}/${staffId}`);
       //console.log(response)
       return response.data;
    } catch (error) {
        console.log("error while calling getStavka api", error.message);
    }
}

