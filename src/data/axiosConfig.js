// axiosConfig.js
import axios from 'axios';


const instance = axios.create();

// Interceptor para las respuestas
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Redirigir a la página de inicio de sesión o la página que prefieras
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
