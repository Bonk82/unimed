import { Card } from 'primereact/card';
import { fetching } from '../data/access';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import dayjs from 'dayjs';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const Reserva = () => {
  const [pacientes, setPacientes] = useState([])
  const [consultas, setConsultas] = useState([])
  const [reservas, setReservas] = useState([])
  const [elPaciente, setElPaciente] = useState(null)
  const [laConsulta, setLaConsulta] = useState(null)
  const [filtros, setFiltros] = useState({global: { value: null, matchMode: FilterMatchMode.CONTAINS }});
  const [buscar, setBuscar] = useState('');
  const [registro, setRegistro] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    cargarPacientes();
    cargarConsultas();
    cargarReservas();
  }, [])

  const cargarPacientes = async ()=>{
    const p = await  fetching({opcion:'listarPaciente'})
    await p.data.data.map(e=>{
      e.conformado = `${e.Nombre} ${e.Apellidos} - ${e.Cedula} ${dayjs(e.FechaNacimiento).format('DD/MM/YYYY')}`
      return e
    })
    setPacientes(p.data?.data)
  }
  const cargarConsultas = async ()=>{
    const p = await  fetching({opcion:'listarConsulta'})
    await p.data.data.map(e=>{
      e.conformado = `${e.Doctor} ${e.Especialidad} - ${dayjs(e.Fecha).format('DD/MM/YYYY')} de ${dayjs(e.HoraInicio).format('HH:mm')} a ${dayjs(e.HoraFin).format('HH:mm')}`
      if(e.Cupo>0) return e
    })
    setConsultas(p.data?.data)
  }

  const cargarReservas = async ()=>{
    const p = await  fetching({opcion:'listarReserva'})
    setReservas(p.data?.data)
  }

  const actionTemplate = (rowData)=>{
    return (
      <div style={{display:'flex',justifyContent:'space-around'}}>
        <Button icon="pi pi-trash" rounded outlined title="Cancelar" severity="danger" onClick={() => confirmarEliminar(rowData)} />
      </div>
    );
  }

  const dateBodyTemplate = (rowData) => {
    return rowData.Fecha ? dayjs(rowData.Fecha).format('DD/MM/YYYY') : '';
  };
  const timeBodyInicio = (rowData) => {
    return dayjs(rowData.HoraInicio).add(4,'hour').format('HH:mm');
  };

  const timeBodyFin = (rowData) => {
    return dayjs(rowData.HoraFin).add(4,'hour').format('HH:mm');
  };

  const confirmarEliminar = (data) => {
    setRegistro(data)
    confirmDialog({
      message: 'Realmente desea cancelar la reserva?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      acceptLabel:'Cancelar',
      rejectLabel:'Mantener',
      accept
    });
  }

  const accept = () => {
    guardarRegistro(registro);
  }

  const guardarRegistro = async (row)=>{
    try {
      const laReserva = {
        opcion:'I',
        id:0,
        idConsulta:laConsulta?.IdConsulta,
        idPaciente:elPaciente?.IdPaciente,
        estado:1
      }
      if(row){
        laReserva.opcion='U'
        laReserva.id=row.IdReserva
        laReserva.idConsulta=row.IdConsulta
        laReserva.idPaciente=row.IdPaciente
        laReserva.estado=0
      } 
      const r = await fetching({opcion:'crudReserva',params:laReserva})
      console.log('guardado',r);
      cargarReservas();
      const tipo = r.status >= 400 ? 'error':'success'
      toast.current.show({severity:tipo, summary: 'Reservas', detail:(laReserva.opcion == 'U' ? 'Reserva Cancelada' : r.data.message), life: 3000});
      setElPaciente(null)
      setLaConsulta(null)
    } catch (error) {
      console.log(error);
      toast.current.show({severity:'error', summary: 'Reservas', detail:error, life: 5000});
    } 
  }

  const onBuscarChange = (e) => {
    const value = e.target.value;
    let _filtros = { ...filtros };
    _filtros["global"].value = value;
    setFiltros(_filtros);
    setBuscar(value);
  };

  const handlesubmit= async(e)=>{
    e.preventDefault();
    guardarRegistro();
  }

  return (
    <>
      <Card title="Reservar Consulta" className='mt-4 text-primary'>
        <form onSubmit={handlesubmit} className='w-full'>
          <div className='grid'>
            <span className='flex flex-column gap-2 w-12 mx-auto md:w-8'>
              <label htmlFor="paciente">Paciente:</label>
              <Dropdown value={elPaciente} id="paciente" name="paciente" onChange={(e) => setElPaciente(e.value)}
              options={pacientes} optionLabel="conformado" placeholder="Seleccione paciente" className="w-full" />
            </span>
            <span className='flex flex-column gap-2 w-12 mx-auto md:w-8'>
              <label htmlFor="consulta">Consulta:</label>
              <Dropdown value={laConsulta} id="consulta" name="consulta" onChange={(e) => setLaConsulta(e.value)}
              options={consultas} optionLabel="conformado" placeholder="Seleccione consulta" className="w-full" />
            </span>
          </div>
          <Button label="Registrar" icon="pi pi-user" className='flex w-12 my-4 mx-auto md:w-8' disabled={!elPaciente || !laConsulta}/>
        </form>
        <Toast ref={toast} />
      </Card>
      <div className="flex justify-content-center align-items-center gap-5">
        <h3>Historial de Reservas</h3>
        <InputText value={buscar} onChange={onBuscarChange} placeholder="Buscar..." />
      </div>
      <DataTable value={reservas} stripedRows  size="small" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}
        removableSort currentPageReportTemplate="{first} a {last} de {totalRecords} reservas"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        globalFilterFields={["IdConsulta","Fecha",'HoraInicio','HoraFin','Cupo','Doctor']} filters={filtros}
        emptyMessage="Reserva no encontrada" className='mx-auto w-12 md:w-8'>
        <Column header="Cancelar" body={actionTemplate} sortable headerClassName="row-actions"></Column>
        <Column field="IdReserva" header="ID" sortable headerClassName="table-header"></Column>
        <Column field="Fecha" dataType="date" body={(dateBodyTemplate)} header="Fecha" sortable headerClassName="table-header"></Column>
        <Column field="HoraInicio" dataType="time" body={timeBodyInicio}  header="Desde (Hrs.)" sortable headerClassName="table-header"></Column>
        <Column field="HoraFin" header="Hasta (Hrs.)" body={timeBodyFin} sortable headerClassName="table-header"></Column>
        <Column field="Cupo" header="Cupos" sortable headerClassName="table-header"></Column>
        <Column field="Doctor" header="Doctor" sortable headerClassName="table-header"></Column>
        <Column field="Especialidad" header="Especialidad" sortable headerClassName="table-header"></Column>
      </DataTable>
      <ConfirmDialog />
      <Toast ref={toast} />
    </>
  )
}

export default Reserva