import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: "http://call-astro.com:5002",
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export default axiosInstance;
