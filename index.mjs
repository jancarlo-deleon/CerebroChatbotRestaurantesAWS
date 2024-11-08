import axios from 'axios';
import dotenv from 'dotenv'; 

//Obtener las variables de sesion desde el .env
dotenv.config();

//Constantes
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
const OPENAI_API_URL = process.env.OPENAI_API_URL;

export const handler = async (event) => {

    

}