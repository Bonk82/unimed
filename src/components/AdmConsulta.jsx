import { Button } from "primereact/button";
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import dayjs from "dayjs"
import { useEffect, useRef, useState } from "react";
import {fetching} from '../data/access'
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";

const AdmConsulta = () => {
  const [consultas, setConsultas] = useState([])
  const [doctores, setDoctores] = useState([])
  const [visible, setVisible] = useState(false);
  const [registro, setRegistro] = useState({});
  const [elDoc, setElDoc] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [consultasALL, setConsultasALL] = useState([]);
  const toast = useRef(null);

  useEffect(() => {
    cargarConsultas();
    cargarDoctores();
  }, [])

  const cargarConsultas = async ()=>{
    const p = await  fetching({opcion:'listarConsulta'})
    setConsultas(p.data?.data)
  }

  const cargarDoctores = async ()=>{
    const p = await  fetching({opcion:'listarDoctor'})
    setDoctores(p.data?.data)
  }

  const actionTemplate = (rowData)=>{
    return (
      <div style={{display:'flex',justifyContent:'space-around'}}>
        <Button icon="pi pi-pencil" rounded outlined title="Editar" onClick={() => editar(rowData)} />
        <Button icon="pi pi-trash" rounded outlined title="Eliminar" severity="danger" onClick={() => confirmarEliminar(rowData)} />
      </div>
    );
  }

  const footerContent = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
      <Button label="Aceptar" icon="pi pi-check" onClick={() => guardarRegistro()}/>
    </div>
  );

  const dateBodyTemplate = (rowData) => {
    return rowData.Fecha ? dayjs(rowData.Fecha).format('DD/MM/YYYY') : '';
  };
  const timeBodyInicio = (rowData) => {
    return dayjs(rowData.HoraInicio).add(4,'hour').format('HH:mm');
  };

  const timeBodyFin = (rowData) => {
    return dayjs(rowData.HoraFin).add(4,'hour').format('HH:mm');
  };

  const editar = (data) => {
    if(data.Fecha) data.Fecha = dayjs(data.Fecha).format('YYYY-MM-DD')
    if(data.HoraInicio) data.HoraInicio = dayjs(data.HoraInicio).add(4,'hours').format('HH:mm')
    if(data.HoraFin) data.HoraFin = dayjs(data.HoraFin).add(4,'hours').format('HH:mm')
    const p = doctores.filter(f=>f.IdDoctor == data.IdDoctor)[0]
    setElDoc(p)
    setRegistro(data)
    setVisible(true)
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let reg = { ...registro };
    reg[`${name}`] = val;
    setRegistro(reg);
  };
  const onInputNumberChange = (e, name) => {
    const val = (e.target && e.target.value) || 0;
    let reg = { ...registro };
    reg[`${name}`] = val;
    setRegistro(reg);
  };

  const confirmarEliminar = (data) => {
    setRegistro(data)
    confirmDialog({
      message: 'Realmente desea eliminar este registro?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      acceptLabel:'Eliminar',
      rejectLabel:'Cancelar',
      accept,
      reject
    });
  }

  const accept = () => {
    guardarRegistro(registro);
  }

  const reject = () => {
      // toast.current.show({ severity: 'warn', summary: 'Cancelado', detail: 'Tu cancelaste la eliminación', life: 3000 });
  }

  const guardarRegistro = async (row)=>{
    try {
      const inputElements = document.querySelectorAll('form input, form select, form textarea');
      const formValues = {};
      inputElements.forEach((element) => {
        formValues[element.name] = element.value;
      });
      console.log('valores',formValues,registro);
      formValues.opcion = registro.IdConsulta > 0 ? 'U':'I';
      formValues.id = registro.IdConsulta || 0;
      formValues.idDoctor = elDoc.IdDoctor
      if(row){
        formValues.opcion = 'D';
        formValues.id = row.IdConsulta
        formValues.fecha = row.Fecha || null
        formValues.horaInicio = row.HoraInicio
        formValues.horaFin = row.HoraFin
        formValues.cupo = row.Cupo
        formValues.idDoctor = row.IdDoctor
      } 
      const r = await fetching({opcion:'crudConsulta',params:formValues})
      console.log('guardado',r);
      cargarConsultas();
      const tipo = r.status >= 400 ? 'error':'success'
      toast.current.show({severity:tipo, summary: 'Gestión Consulta', detail:r.data.message, life: 3000});
      setElDoc({})
    } catch (error) {
      console.log(error);
      toast.current.show({severity:'error', summary: 'Gestión Consulta', detail:error, life: 5000});
    } finally{
      setVisible(false);
    }
  }

  const nuevo = ()=>{
    setRegistro({})
    setVisible(true)
  }

  const onGlobalFilterChange = (e) => {
    if(consultasALL.length==0) setConsultasALL(Object.assign(consultas))
    const value = e.target.value;
    setGlobalFilterValue(value)
    const pivot = consultasALL.filter(f=>f.HoraInicio.toString().includes(value) || dayjs(f.Fecha).format('DD/MM/YYYY').includes(value)
    || f.HoraFin.toString().includes(value) || f.Cupo.toString().includes(value) || f.Doctor.includes(value));
    setConsultas(pivot);
  };

  return (
    <div style={{textAlign:'center'}}>
      <div className="flex justify-content-center align-items-center gap-5">
        <h3>Listado de Consultas</h3>
        <Button rounded outlined icon="pi pi-plus" size="small" onClick={nuevo} severity="success" tooltip="Agregar Consulta"/>
        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." />
      </div>
      <DataTable value={consultas} stripedRows  size="small" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]} removableSort >
        <Column header="Acciones" body={actionTemplate} sortable headerClassName="row-actions"></Column>
        <Column field="IdConsulta" header="ID" sortable headerClassName="table-header"></Column>
        <Column field="Fecha" dataType="date" body={(dateBodyTemplate)} header="Fecha" sortable headerClassName="table-header"></Column>
        <Column field="HoraInicio" dataType="time" body={timeBodyInicio}  header="Desde (Hrs.)" sortable headerClassName="table-header"></Column>
        <Column field="HoraFin" header="Hasta (Hrs.)" body={timeBodyFin} sortable headerClassName="table-header"></Column>
        <Column field="Cupo" header="Cupos" sortable headerClassName="table-header"></Column>
        <Column field="Doctor" header="Doctor" sortable headerClassName="table-header"></Column>
      </DataTable>
      <Dialog header="Editar Consulta" modal visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={footerContent}>
        <form action="" style={{display:'flex',flexDirection:'row',gap:'2rem',flexWrap:'wrap'}}>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="fecha">Fecha</label>
            <InputText id="fecha" type="date" onChange={(e) => onInputChange(e, 'Fecha')} name="fecha" value={registro.Fecha} autoFocus/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="horaInicio">Desde (Hrs.)</label>
            <InputText id="horaInicio" type="time" name="horaInicio" onChange={(e) => onInputChange(e, 'HoraInicio')} value={registro.HoraInicio}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="horaFin">Hasta (Hrs.)</label>
            <InputText id="horaFin" type="time" name="horaFin" onChange={(e) => onInputChange(e, 'HoraFin')} value={registro.HoraFin}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="cupo">Cupos</label>
            <InputText id="cupo" keyfilter="int" name="cupo" onChange={(e) => onInputNumberChange(e, 'Cupo')} value={registro.Cupo}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="doctor">Doctor</label>
            <Dropdown value={elDoc} id="doctor" name="doctor" onChange={(e) => setElDoc(e.value)}
            options={doctores} optionLabel="Nombre" placeholder="Selecione Doctor" className="w-full md:w-14rem" />
          </span>
        </form>
      </Dialog>
      <ConfirmDialog />
      <Toast ref={toast} />
    </div>
  )
}

export default AdmConsulta