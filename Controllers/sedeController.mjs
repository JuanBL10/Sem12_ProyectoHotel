import Sede from '../Models/sede.mjs';
import {consultarHotelesExportar, dibujarTablaExportar, URL} from './hotelController.mjs';

const URLSedes = 'https://paginas-web-cr.com/Api/hotelApi/sede/sede.php';
let temporizadorBusqueda;
let idSedeEliminar = -1;
let idSedeEditar = -1;
let modoModal = 'agregar';

document.addEventListener('DOMContentLoaded', () => {
    consultarSedes();

    //Eventos de barra de busqueda

    document.querySelector('#barraBusquedaSedes').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);

        if(evento.target.value.trim() == ''){
            consultarSedes();
            return;
        }

        temporizadorBusqueda = setTimeout(() => {buscarSedeIdNombre(evento.target.value.trim())}, 300);
    });

    document.getElementById('botonLimpiarBusquedaSedes').addEventListener('click', () => {
        document.querySelector('#barraBusquedaSedes').value = '';
        consultarSedes();
    });

    //Eventos de agregar sede

    document.getElementById('botonModalAgregarSedeBuscarHotel').addEventListener('click', async evento => {
        modoModal = 'agregar';
        const data = await consultarHotelesExportar();
        dibujarTablaExportar(data, 'tablaHotelesEnModalAgregarSede');
    });

    document.getElementById('tablaHotelesEnModalAgregarSede').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if(filaSeleccionada == null) return;

        const idHotelSeleccionado = filaSeleccionada.getAttribute('data-id');
        const nombreHotel = filaSeleccionada.dataset.nombre;

        document.getElementById('modalAgregarSedeBuscarHotel').querySelector('.btn-close').click();

        if(modoModal === 'editar') {
            document.getElementById('inputModalEditarSedeIdHotelSeleccionado').value = idHotelSeleccionado;
            document.getElementById('inputModalEditarSedeNombreHotelSeleccionado').value = nombreHotel;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarSede')).show();
        } else {
            document.getElementById('inputModalAgregarSedeIdHotelSeleccionado').value = idHotelSeleccionado;
            document.getElementById('inputModalAgregarSedeNombreHotelSeleccionado').value = nombreHotel;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarSede')).show();
        }
    });

    document.getElementById('formAgregarSede').addEventListener('submit', evento => {
        evento.preventDefault();
        const sede = new Sede(
            null,
            document.getElementById('inputModalAgregarSedeIdHotelSeleccionado').value,
            document.getElementById('inputModalAgregarSedeNombreSede').value,
            document.getElementById('inputModalAgregarSedePais').value,
            document.getElementById('inputModalAgregarSedeProvincia').value,
            document.getElementById('inputModalAgregarSedeCiudad').value,
            document.getElementById('inputModalAgregarSedeDireccion').value,
            document.getElementById('inputModalAgregarSedeTelefono').value,
            document.getElementById('inputModalAgregarSedeCorreo').value,
            document.getElementById('inputModalAgregarSedeNumHabitaciones').value,
            document.getElementById('inputModalAgregarSedeUsuario').value
        );
        agregarSede(sede);
    });

    //Eventos de editar sede

    document.querySelector('#modalEditarSede .btn-close').addEventListener('click', evento => {
        document.getElementById('formEditarSede').reset();
    });

    document.querySelector('#modalEditarSede .btn-secondary').addEventListener('click', evento => {
        document.getElementById('formEditarSede').reset();
    });

    document.getElementById('formEditarSede').addEventListener('submit', (evento) => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    document.getElementById('botonModalEditarSedeBuscarHotel').addEventListener('click', async evento => {
        modoModal = 'editar';
        const data = await consultarHotelesExportar();
        dibujarTablaExportar(data, 'tablaHotelesEnModalAgregarSede');
    });

    //Eventos de eliminar sede

    document.getElementById('modalEliminarSede').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarSede(idSedeEliminar);
        document.querySelector('#modalEliminarSede .btn-close').click();
    });
});

//Funciones para consultar sedes y dibujar la tabla de sedes

async function consultarSedes(){
    try {
        const response = await fetch(URLSedes, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaSedes(data.data);
    }
    catch (error) {
        console.error('Error al consultar las sedes:', error);
    }
}

async function buscarSedeIdNombre(valorBusqueda){
    let urlBusqueda = '';

    if(isNaN(valorBusqueda)){
        urlBusqueda = URLSedes + '?nombre=' + valorBusqueda;
    } else {
        urlBusqueda = URLSedes + '?id=' + valorBusqueda;
    }

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaSedes(data.data);
    }
    catch(error){
        console.error('Error al buscar la sede:', error);
    }
}

function dibujarTablaSedes(dataSedes){
    const tabla = document.getElementById('tablaSedes');
    tabla.innerHTML = '';
    dataSedes.forEach(sede => {
        let fila = `<tr>
            <td scope="row">${sede.id}</td>
            <td>${sede.id_hotel}</td>
            <td>${sede.nombre}</td>
            <td>${sede.pais}</td>
            <td>${sede.provincia}</td>
            <td>${sede.ciudad}</td>
            <td>${sede.direccion}</td>
            <td>${sede.telefono}</td>
            <td>${sede.correo}</td>
            <td>${sede.cantidad_habitaciones}</td>
            <td>${sede.usuario}</td>
            <td>
                <div class="container-fluid d-flex gap-2">
                    <button class="btn btn-sm btn-warning" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEditarSede" data-id="${sede.id}">
                        <i class="bi bi-brush-fill"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEliminarSede" data-id="${sede.id}">
                        <i class="bi bi-trash-fill"></i>Eliminar
                    </button>
                </div>
            </td>
        </tr>`;
        tabla.innerHTML += fila;
    });
    document.querySelectorAll('#tablaSedes .btn-warning').forEach(btn => {
        btn.addEventListener('click', evento => {
            const idSede = evento.currentTarget.dataset.id;
            abrirModalEditarSede(idSede);
        });
    });
    document.querySelectorAll('#tablaSedes .btn-danger').forEach(btn => {
        btn.addEventListener('click', evento => {
            idSedeEliminar = evento.currentTarget.dataset.id;
        });
    });
}

//Funciones para agregar sede

async function agregarSede(sede){
    try{
        const response = await fetch(URLSedes, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sede)
        });
        const data = await response.json();
        console.log(data);
        alert('Sede agregada exitosamente');
        document.querySelector('#modalAgregarSede .btn-close').click();
        consultarSedes();
    }
    catch(error){
        console.error('Error al agregar la sede:', error);
    }
}

////////////////////////////

async function abrirModalEditarSede(id) {
    try {
        const dataSede = await buscarSedeId(id);
        idSedeEditar = dataSede.id;
        document.getElementById('inputModalEditarSedeIdHotelSeleccionado').value = dataSede.id_hotel;
        document.getElementById('inputModalEditarSedeNombreHotelSeleccionado').value = '';
        document.getElementById('inputModalEditarSedeNombreSede').value = dataSede.nombre;
        document.getElementById('inputModalEditarSedePais').value = dataSede.pais;
        document.getElementById('inputModalEditarSedeProvincia').value = dataSede.provincia;
        document.getElementById('inputModalEditarSedeCiudad').value = dataSede.ciudad;
        document.getElementById('inputModalEditarSedeDireccion').value = dataSede.direccion;
        document.getElementById('inputModalEditarSedeTelefono').value = dataSede.telefono;
        document.getElementById('inputModalEditarSedeCorreo').value = dataSede.correo;
        document.getElementById('inputModalEditarSedeNumHabitaciones').value = dataSede.cantidad_habitaciones;
        document.getElementById('inputModalEditarSedeUsuario').value = dataSede.usuario;
    }
    catch(error) {
        alert('Error al cargar los datos de la sede: ' + error.message);
        console.error(error);
    }
}

async function enviarDatosEditar() {
    const sedeEditar = new Sede(
        idSedeEditar,
        document.getElementById('inputModalEditarSedeIdHotelSeleccionado').value,
        document.getElementById('inputModalEditarSedeNombreSede').value,
        document.getElementById('inputModalEditarSedePais').value,
        document.getElementById('inputModalEditarSedeProvincia').value,
        document.getElementById('inputModalEditarSedeCiudad').value,
        document.getElementById('inputModalEditarSedeDireccion').value,
        document.getElementById('inputModalEditarSedeTelefono').value,
        document.getElementById('inputModalEditarSedeCorreo').value,
        document.getElementById('inputModalEditarSedeNumHabitaciones').value,
        document.getElementById('inputModalEditarSedeUsuario').value
    );

    try {
        const response = await fetch(URLSedes, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sedeEditar)
        });
        const data = await response.json();
        console.log(data);
        alert('Sede editada exitosamente');
        document.getElementById('modalEditarSede').querySelector('.btn-close').click();
        consultarSedes();
    }
    catch (error) {
        console.error('Error al editar la sede:', error);
    }
}

async function buscarSedeId(id) {
    const urlBusqueda = URLSedes + '?id=' + id;
    try {
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        return data.data[0];
    }
    catch (error) {
        console.error('Error al buscar la sede por ID:', error);
    }
}

async function eliminarSede(id) {
    try {
        const response = await fetch(URLSedes, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data);
        alert('Sede eliminada exitosamente');
        consultarSedes();
    }
    catch (error) {
        console.error('Error al eliminar la sede:', error);
    }
}
