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

const AdmEspecialidad = () => {

  const [especialidades, setEspecialidades] = useState([])
  const [visible, setVisible] = useState(false);
  const [registro, setRegistro] = useState({});
  const [filtros, setFiltros] = useState({global: { value: null, matchMode: FilterMatchMode.CONTAINS }});
  const [buscar, setBuscar] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    cargarEspecialidades();
  }, [])

  const cargarEspecialidades = async ()=>{
    const p = await  fetching({opcion:'listarEspecialidad'})
    setEspecialidades(p.data?.data)
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
      <Button label="Aceptar" icon="pi pi-check" onClick={() => guardarRegistro()} />
    </div>
  );

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
      formValues.opcion = registro.IdEspecialidad > 0 ? 'U':'I';
      formValues.id = registro.IdEspecialidad || 0;
      if(row){
        formValues.opcion = 'D';
        formValues.id = row.IdEspecialidad
        formValues.descripcion = row.Descripcion
      } 
      const r = await fetching({opcion:'crudEspecialidad',params:formValues})
      console.log('guardado',r);
      cargarEspecialidades();
      const tipo = r.status >= 400 ? 'error':'success'
      toast.current.show({severity:tipo, summary: 'Gestión Especialidad', detail:r.data.message, life: 3000});
    } catch (error) {
      console.log(error);
      toast.current.show({severity:'error', summary: 'Gestión Especialidad', detail:error, life: 5000});
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
        <h3>Listado de Especialidades</h3>
        <Button rounded outlined icon="pi pi-plus" size="small" onClick={nuevo} severity="success" tooltip="Agregar Especialidad"/>
        <InputText value={buscar} onChange={onBuscarChange} placeholder="Buscar..." />
      </div>
      <DataTable value={especialidades} stripedRows  size="small" paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}
        removableSort currentPageReportTemplate="{first} a {last} de {totalRecords} especialidades"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        globalFilterFields={["Descripcion","IdEspecialidad"]} filters={filtros}
        emptyMessage="Especialidad no encontrada">
        <Column header="Acciones" body={actionTemplate} headerClassName="row-actions"></Column>
        <Column field="IdEspecialidad" header="ID" sortable headerClassName="table-header"></Column>
        <Column field="Descripcion" header="Descripción" sortable headerClassName="table-header"></Column>
      </DataTable>
      <Dialog header="Editar Espcialidad" modal visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={footerContent}>
        <form action="" style={{display:'flex',flexDirection:'row',gap:'2rem',flexWrap:'wrap'}}>
          <span style={{display:'flex',flexDirection:'column',gap:'0.2rem'}}>
            <label htmlFor="descripcion">Descripción</label>
            <InputText id="descripcion" name="descripcion" onChange={(e) => onInputChange(e, 'Descripcion')} value={registro.Descripcion} autoFocus/>
          </span>
        </form>
      </Dialog>
      <ConfirmDialog />
      <Toast ref={toast} />
    </div>
  )
}

export default AdmEspecialidad