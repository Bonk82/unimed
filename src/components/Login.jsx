import { useAuth } from '../context/AuthContext';
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import {fetching} from '../data/access'
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const {login} = useAuth();
  const handlesubmit = async (e)=>{
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const r = await fetching({user:data.get('username'),password:data.get('password'),opcion:'login'})
    console.log('despues del fetch',r);
    if(r.status == 200){
      login(data.get('username'));
      toast.current.show({severity:'success', summary: 'Control Acceso', detail:r.data.message, life: 2000});
      localStorage.setItem('conex',r.data.data[0].token)
      navigate("/")
    }
    if(r.status != 200) toast.current.show({severity:'error', summary: 'Control Acceso', detail:r.data.message || 'Icnorrecto', life: 4000});
  }
  return (
    <div className="main-login">
      <div className="card-login">
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{letterSpacing:'1.4rem',fontWeight:'600',color:'#059e6b',paddingLeft:'0.8rem'}}>UNIMED</h1>
          <h3 style={{margin:'1rem 0',color:'#81C784'}}>Bienvenido</h3>
        </div>
        <form onSubmit={handlesubmit}>
          <span className="p-float-label" style={{marginBottom:'2rem'}}>
            <InputText id="username" name='username' />
            <label htmlFor="username">Usuario</label>
          </span>
          <span className="p-float-label">  
            <InputText id="password" name='password' type='password'/>
            <label htmlFor="password">Contraseña</label>
          </span>

          <Button label="Ingresar" icon="pi pi-user" style={{width:'100%',margin:'2rem 0'}}/>
        </form>
      </div>
      <Toast ref={toast} />
    </div>
  )
}

export default Login