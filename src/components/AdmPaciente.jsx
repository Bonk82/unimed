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
import { FilterMatchMode } from "primereact/api";

const AdmPaciente = () => {

  const [pacientes, setPacientes] = useState([])
  const [visible, setVisible] = useState(false);
  const [registro, setRegistro] = useState({});
  const [filtros, setFiltros] = useState({global: { value: null, matchMode: FilterMatchMode.CONTAINS }});
  const [buscar, setBuscar] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    cargarPacientes();
  }, [])

  const cargarPacientes = async ()=>{
    const p = await  fetching({opcion:'listarPaciente'})
    setPacientes(p.data?.data)
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
    if(data.FechaNacimiento) data.FechaNacimiento = dayjs(data.FechaNacimiento).format('YYYY-MM-DD')
    setRegistro(data)
    setVisible(true)
  }

  const onInputChange = (e, name) => {
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
    });
  }

  const accept = () => {
    guardarRegistro(registro);
  }

  const guardarRegistro = async (row)=>{
    try {
      const inputElements = document.querySelectorAll('form input, form select, form textarea');
      const formValues = {};
      inputElements.forEach((element) => {
        formValues[element.name] = element.value;
      });
      console.log('valores',formValues,registro);
      formValues.opcion = registro.IdPaciente > 0 ? 'U':'I';
      formValues.id = registro.IdPaciente || 0;
      if(row){
        formValues.opcion = 'D';
        formValues.id = row.IdPaciente
        formValues.nombre = row.Nombre
        formValues.apellidos = row.Apellidos
        formValues.cedula = row.Cedula
        formValues.direccion = row.Direccion
        formValues.telefono = row.Telefono
        formValues.numeroSeguro = row.NumeroSeguro
        formValues.mutualidad = row.Mutualidad
        formValues.fechaNacimiento = row.FechaNacimiento || null
      } 
      const r = await fetching({opcion:'crudPaciente',params:formValues})
      console.log('guardado',r);
      cargarPacientes();
      const tipo = r.status >= 400 ? 'error':'success'
      toast.current.show({severity:tipo, summary: 'Gestión Paciente', detail:r.data.message, life: 3000});
    } catch (error) {
      console.log(error);
      toast.current.show({severity:'error', summary: 'Gestión Paciente', detail:error, life: 5000});
    } finally{
      setVisible(false);
    }
  }

  const nuevo = ()=>{
    setRegistro({})
    setVisible(true)
  }

  const onBuscarChange = (e) => {
    const value = e.target.value;
    let _filtros = { ...filtros };
    _filtros["global"].value = value;
    setFiltros(_filtros);
    setBuscar(value);
  };

  return (
    <div style={{textAlign:'center'}}>
      <div className="flex justify-content-center align-items-center gap-5">
        <h3>Listado de Pacientes</h3>
        <Button rounded outlined icon="pi pi-plus" size="small" onClick={nuevo} severity="success" tooltip="Agregar Paciente"/>
        <InputText value={buscar} onChange={onBuscarChange} placeholder="Buscar..." />
      </div>
      <DataTable value={pacientes} stripedRows  size="small" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}
        removableSort currentPageReportTemplate="{first} a {last} de {totalRecords} pacientes"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        globalFilterFields={["IdPaciente","Nombre",'Apellidos','Cedula','Direccion','Telefono','NumeroSeguro','Mutualidad','FechaNacimiento']} filters={filtros}
        emptyMessage="Paciente no encontrado">
        <Column header="Acciones" body={actionTemplate} headerClassName="row-actions"></Column>
        <Column field="IdPaciente" header="ID" sortable headerClassName="table-header"></Column>
        <Column field="Nombre" header="Nombre" sortable headerClassName="table-header"></Column>
        <Column field="Apellidos" header="Apellidos" sortable headerClassName="table-header"></Column>
        <Column field="Cedula" header="C.I." sortable headerClassName="table-header"></Column>
        <Column field="Direccion" header="Dirección" sortable headerClassName="table-header"></Column>
        <Column field="Telefono" header="Teléfonos" sortable headerClassName="table-header"></Column>
        <Column field="NumeroSeguro" header="Número Seguro" sortable headerClassName="table-header"></Column>
        <Column field="Mutualidad" header="Mutualidad" sortable headerClassName="table-header"></Column>
        <Column field="FechaNacimiento" body={dateBodyTemplate} header="Fecha Nacimiento" sortable headerClassName="table-header"></Column>
      </DataTable>
      <Dialog header="Editar Paciente" modal visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={footerContent}>
        <form action="" style={{display:'flex',flexDirection:'row',gap:'2rem',flexWrap:'wrap'}}>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="nombre">Nombre</label>
            <InputText id="nombre" name="nombre" onChange={(e) => onInputChange(e, 'Nombre')} value={registro.Nombre} autoFocus/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="apellidos">Apellidos</label>
            <InputText id="apellidos" name="apellidos" onChange={(e) => onInputChange(e, 'Apellidos')} value={registro.Apellidos}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="cedula">C.I.</label>
            <InputText id="cedula" name="cedula" keyfilter="int" onChange={(e) => onInputChange(e, 'Cedula')} value={registro.Cedula}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="direccion">Dirección</label>
            <InputText id="direccion" name="direccion" onChange={(e) => onInputChange(e, 'Direccion')} value={registro.Direccion}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="telefono">Telefono</label>
            <InputText id="telefono" name="telefono" keyfilter="int" onChange={(e) => onInputChange(e, 'Telefono')} value={registro.Telefono}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="numeroSeguro">Número Seguro</label>
            <InputText id="numeroSeguro" name="numeroSeguro" onChange={(e) => onInputChange(e, 'NumeroSeguro')} value={registro.NumeroSeguro}/>
          </span>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="mutualidad">Mutualidad</label>
            <InputText id="mutualidad" name="mutualidad" onChange={(e) => onInputChange(e, 'Mutualidad')} value={registro.Mutualidad}/>
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

export default AdmPaciente