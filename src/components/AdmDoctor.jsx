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

const AdmDoctor = () => {
  const [doctores, setDoctores] = useState([])
  const [especialidades, setEspecialidad] = useState([])
  const [visible, setVisible] = useState(false);
  const [registro, setRegistro] = useState({});
  const [laEspec, setLaEspec] = useState({})
  const toast = useRef(null);

  useEffect(() => {
    cargarDoctores();
    cargarEspecialidades();
  }, [])

  const cargarDoctores = async ()=>{
    const p = await  fetching({opcion:'listarDoctor'})
    setDoctores(p.data?.data)
  }
  const cargarEspecialidades = async ()=>{
    const p = await  fetching({opcion:'listarEspecialidad'})
    setEspecialidad(p.data?.data)
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
    return rowData.FechaNacimiento ? dayjs(rowData.FechaNacimiento).format('DD/MM/YYYY') : '';
  };

  const editar = (data) => {
    const p = especialidades.filter(f=>f.IdEspecialidad == data.IdEspecialidad)[0]
    setLaEspec(p)
    if(data.FechaNacimiento) data.FechaNacimiento = dayjs(data.FechaNacimiento).format('YYYY-MM-DD')
    setRegistro({...data})
    setVisible(true)
  }

  const onInputChange = (e, name) => {
    console.log(e,name);
    const val = (e.target && e.target.value) || '';
    let reg = { ...registro };
    reg[`${name}`] = val.toUpperCase();
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
      // console.log('valores',formValues,registro,laEspec);
      formValues.opcion = registro.IdDoctor > 0 ? 'U':'I';
      formValues.id = registro.IdDoctor || 0;
      formValues.idEspecialidad = laEspec.IdEspecialidad
      if(row){
        formValues.opcion = 'D';
        formValues.id = row.IdDoctor
        formValues.nombre = row.Nombre
        formValues.idEspecialidad = row.IdEspecialidad
        formValues.direccion = row.Direccion
        formValues.telefono = row.Telefonos
        formValues.fechaNacimiento = row.FechaNacimiento || null
      } 
      const r = await fetching({opcion:'crudDoctor',params:formValues})
      console.log('guardado',r);
      cargarDoctores();
      const tipo = r.status >= 400 ? 'error':'success'
      toast.current.show({severity:tipo, summary: 'Gestión Doctor', detail:r.data.message, life: 3000});
      setLaEspec({})
    } catch (error) {
      console.log(error);
      toast.current.show({severity:'error', summary: 'Gestión Doctor', detail:error, life: 5000});
    } finally{
      setVisible(false);
    }
  }

  const nuevo = ()=>{
    setRegistro({})
    setVisible(true)
  }

  return (
    <div style={{textAlign:'center'}}>
      <div className="flex justify-content-center align-items-center gap-5">
        <h3>Listado de Doctores</h3>
        <Button rounded outlined icon="pi pi-plus" size="small" onClick={nuevo} severity="success" tooltip="Agregar Doctor"/>
      </div>
      <DataTable value={doctores} stripedRows  size="small">
        <Column header="Acciones" body={actionTemplate} style={{ width: 'clamp(100px, 110px, 120px)' }}></Column>
        <Column field="IdDoctor" header="ID"></Column>
        <Column field="Nombre" header="Nombre"></Column>
        <Column field="Especialidad" header="Especialidad"></Column>
        <Column field="Direccion" header="Dirección"></Column>
        <Column field="Telefonos" header="Telefonos"></Column>
        <Column field="FechaNacimiento" dataType="date" body={dateBodyTemplate} header="Fecha Nacimiento"></Column>
      </DataTable>
      <Dialog header="Editar Doctor" modal visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={footerContent}>
        <form action="" style={{display:'flex',flexDirection:'row',gap:'2rem',flexWrap:'wrap'}}>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="nombre">Nombre Doctor</label>
            <InputText id="nombre" name="nombre" onChange={(e) => onInputChange(e, 'Nombre')} value={registro.Nombre} autoFocus/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="especialidad">Especialidad</label>
            <Dropdown value={laEspec} id="especialidad" name="especialidad" onChange={(e) => setLaEspec(e.value)}
            options={especialidades} optionLabel="Descripcion" placeholder="Selecione Especialidad" className="w-full md:w-14rem" />
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="direccion">Dirección</label>
            <InputText id="direccion" name="direccion" onChange={(e) => onInputChange(e, 'Direccion')}  value={registro.Direccion}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="telefono">Teléfonos</label>
            <InputText id="telefono" name="telefono" keyfilter="int" onChange={(e) => onInputChange(e, 'Telefonos')} value={registro.Telefonos}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="fechaNacimiento">Fecha Nacimiento</label>
            <InputText id="fechaNacimiento" type="date" name="fechaNacimiento" onChange={(e) => onInputChange(e, 'FechaNacimiento')} value={registro.FechaNacimiento}/>
          </span>
        </form>
      </Dialog>
      <ConfirmDialog />
      <Toast ref={toast} />
    </div>
  )
}

export default AdmDoctor