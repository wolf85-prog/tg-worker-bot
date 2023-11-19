import {$host} from "./index";


export const getProjectsAll = async () =>{
    try {
       let response = await $host.get(`api/projectall`);
       //console.log(response);
       return response.data;
    } catch (error) {
        console.log("error while calling getProjectAll api", error.message);
    }
}
