import { Menubar } from "primereact/menubar";
import { useAuth } from '../context/AuthContext';


const NavBar = () => {
  const { user} = useAuth();

  const items = [   
    {label: 'Gestión',icon: 'pi pi-fw pi-verified',url:'admin'},
    {label: 'Reservas',icon: 'pi pi-fw pi-file-edit',url:'reserva'}
  ];

  const start = <img alt="logo" src="/unimed.png" height="40" className="mr-2"></img>;

  return (
      (user || localStorage.getItem('conex')) && <div className="card">
          <Menubar model={items} start={start} />
      </div>
  )
}

export default NavBar