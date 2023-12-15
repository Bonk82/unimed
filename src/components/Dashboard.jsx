import AdmDoctor from "./AdmDoctor"
import AdmEspecialidad from "./AdmEspecialidad"
import AdmConsulta from "./AdmConsulta"
import AdmPaciente from "./AdmPaciente"


const Dashboard = () => {
  
  return (
    <div>
      <div className="dashboard">
        <AdmDoctor/>
        <AdmEspecialidad/>
        <AdmConsulta/>
        <AdmPaciente/>
      </div>
    </div>
  )
}

export default Dashboard