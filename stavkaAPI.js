require("dotenv").config();
const fs = require('fs');
const axios = require("axios");

const $host_stavka = axios.create({
    baseURL: process.env.REACT_APP_API_URL_STAVKA
})

const headers = {};

// const httpsAgent = new https.Agent({
//   ca: fs.readFileSync('./certs/cert.pem'),
//   cert: fs.readFileSync('./certs/cert.pem'),
// })

// Certificate
const privateKey = fs.readFileSync('privkey.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/chain.pem', 'utf8');

const httpsAgent = new https.Agent({
    key: privateKey,
    cert: certificate,
    ca: ca
  })

//const data = await axios.get(url, { httpsAgent, headers })

module.exports = async function getStavka(projectId, staffId) {
//export const getStavka = async (projectId, staffId) =>{
    try {
       let response = await $host_stavka.get(`pre-payment/${projectId}/${staffId}`, { httpsAgent, headers });
       //console.log(response)
       return response.data;
    } catch (error) {
        console.log("error while calling getStavka api", error.message);
    }
}

