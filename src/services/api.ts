import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
console.log("Conectando na API:", baseURL); // <--- Adicione isso para debugar no console do navegador

const api = axios.create({
  baseURL,
});

export default api;