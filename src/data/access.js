import axios from "../data/axiosConfig.js";
// import { useNavigate } from "react-router-dom";

const token = localStorage.getItem("conex");

export const fetching = async ({user,password,opcion,params}) => {
  // const navigate = useNavigate();
  try {
    console.log(user,password,opcion,params);
    const headers = {
      "Content-Type": "application/json",
      Authorization:token,
      'Access-Control-Allow-Origin':'*'
    };
    const data = {user,password}

    const options = {
      baseURL:import.meta.env.VITE_REACT_APP_URL_BASE,
      port:import.meta.env.VITE_REACT_APP_BACK_PORT,
      url:'api/'+opcion,
      method: opcion == 'login'? 'POST':'GET',
      headers,
      data
    }

    console.log('axios',options);

    // const resp = await axios.post('http://localhost:3006/api/login',options)
    const resp = await axios({params,...options})
    console.log('desde access',resp);
    return resp;
  } catch (error) {
    return  error.response || error;
  }
}
