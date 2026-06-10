import Reservacion from '../Models/reservacion.mjs';
import { consultarClientesExportar, dibujarTablaClientesExportar } from './clienteController.mjs';
import { consultarHabitacionesExportar, dibujarTablaHabitacionesExportar } from './habitacionController.mjs';

const URLReservaciones = 'https://paginas-web-cr.com/Api/hotelApi/reservacion/reservacion.php';
let temporizadorBusqueda;
let idReservacionEliminar = -1;
let idReservacionEditar = -1;
let modoModal = 'agregar';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tablaReservaciones') == null) return;
    consultarReservaciones();

    // Barra ID reservación
    document.querySelector('#barraBusquedaReservaciones').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        document.getElementById('barraBusquedaReservacionesPorCliente').value = '';
        document.getElementById('selectBusquedaEstadoReservaciones').value = '';

        if(evento.target.value.trim() == ''){
            consultarReservaciones();
            return;
        }

        temporizadorBusqueda = setTimeout(() => {buscarReservacionId(evento.target.value.trim())}, 300);
    });

    document.getElementById('botonLimpiarBusquedaReservaciones').addEventListener('click', () => {
        document.querySelector('#barraBusquedaReservaciones').value = '';
        consultarReservaciones();
    });

    // Barra ID cliente
    document.querySelector('#barraBusquedaReservacionesPorCliente').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        document.getElementById('barraBusquedaReservaciones').value = '';
        document.getElementById('selectBusquedaEstadoReservaciones').value = '';

        if(evento.target.value.trim() == ''){
            consultarReservaciones();
            return;
        }

        temporizadorBusqueda = setTimeout(() => {buscarReservacionPorCliente(evento.target.value.trim())}, 300);
    });

    document.getElementById('botonLimpiarBusquedaReservacionesPorCliente').addEventListener('click', () => {
        document.querySelector('#barraBusquedaReservacionesPorCliente').value = '';
        consultarReservaciones();
    });

    // Select estado
    document.getElementById('selectBusquedaEstadoReservaciones').addEventListener('change', evento => {
        document.getElementById('barraBusquedaReservaciones').value = '';
        document.getElementById('barraBusquedaReservacionesPorCliente').value = '';

        if(evento.target.value == ''){
            consultarReservaciones();
            return;
        }

        buscarReservacionPorEstado(evento.target.value);
    });

    // --- Agregar reservación ---

    document.getElementById('botonModalAgregarReservacionBuscarCliente').addEventListener('click', async () => {
        modoModal = 'agregar';
        const data = await consultarClientesExportar();
        dibujarTablaClientesExportar(data, 'tablaClientesEnModalReservacion');
    });

    document.getElementById('botonModalAgregarReservacionBuscarHabitacion').addEventListener('click', async () => {
        modoModal = 'agregar';
        const data = await consultarHabitacionesExportar();
        dibujarTablaHabitacionesExportar(data, 'tablaHabitacionesEnModalReservacion');
    });

    document.getElementById('tablaClientesEnModalReservacion').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if(filaSeleccionada == null) return;

        const idCliente = filaSeleccionada.getAttribute('data-id');
        const nombreCliente = filaSeleccionada.dataset.nombre;

        document.getElementById('modalReservacionBuscarCliente').querySelector('.btn-close').click();

        if(modoModal === 'editar') {
            document.getElementById('inputModalEditarReservacionIdClienteSeleccionado').value = idCliente;
            document.getElementById('inputModalEditarReservacionNombreClienteSeleccionado').value = nombreCliente;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarReservacion')).show();
        } else {
            document.getElementById('inputModalAgregarReservacionIdClienteSeleccionado').value = idCliente;
            document.getElementById('inputModalAgregarReservacionNombreClienteSeleccionado').value = nombreCliente;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarReservacion')).show();
        }
    });

    document.getElementById('tablaHabitacionesEnModalReservacion').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if(filaSeleccionada == null) return;

        const idHabitacion = filaSeleccionada.getAttribute('data-id');
        const numHabitacion = filaSeleccionada.dataset.numero;

        document.getElementById('modalReservacionBuscarHabitacion').querySelector('.btn-close').click();

        if(modoModal === 'editar') {
            document.getElementById('inputModalEditarReservacionIdHabitacionSeleccionado').value = idHabitacion;
            document.getElementById('inputModalEditarReservacionNumHabitacionSeleccionado').value = numHabitacion;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarReservacion')).show();
        } else {
            document.getElementById('inputModalAgregarReservacionIdHabitacionSeleccionado').value = idHabitacion;
            document.getElementById('inputModalAgregarReservacionNumHabitacionSeleccionado').value = numHabitacion;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarReservacion')).show();
        }
    });

    document.querySelector('#modalAgregarReservacion .btn-close').addEventListener('click', () => {
        document.getElementById('formAgregarReservacion').reset();
    });

    document.querySelector('#modalAgregarReservacion .btn-secondary').addEventListener('click', () => {
        document.getElementById('formAgregarReservacion').reset();
    });

    document.getElementById('formAgregarReservacion').addEventListener('submit', evento => {
        evento.preventDefault();
        const reservacion = new Reservacion(
            null,
            document.getElementById('inputModalAgregarReservacionIdClienteSeleccionado').value,
            document.getElementById('inputModalAgregarReservacionIdHabitacionSeleccionado').value,
            document.getElementById('inputModalAgregarReservacionFechaEntrada').value,
            document.getElementById('inputModalAgregarReservacionFechaSalida').value,
            document.getElementById('inputModalAgregarReservacionCantidadPersonas').value,
            document.getElementById('inputModalAgregarReservacionEstado').value,
            document.getElementById('inputModalAgregarReservacionTotal').value,
            document.getElementById('inputModalAgregarReservacionUsuario').value
        );
        agregarReservacion(reservacion);
    });

    // --- Editar reservación ---

    document.querySelector('#modalEditarReservacion .btn-close').addEventListener('click', () => {
        document.getElementById('formEditarReservacion').reset();
    });

    document.querySelector('#modalEditarReservacion .btn-secondary').addEventListener('click', () => {
        document.getElementById('formEditarReservacion').reset();
    });

    document.getElementById('formEditarReservacion').addEventListener('submit', evento => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    // --- Eliminar reservación ---

    document.getElementById('modalEliminarReservacion').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarReservacion(idReservacionEliminar);
        document.querySelector('#modalEliminarReservacion .btn-close').click();
    });
});

async function consultarReservaciones(){
    try {
        const response = await fetch(URLReservaciones, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaReservaciones(data.data);
    }
    catch (error) {
        console.error('Error al consultar las reservaciones:', error);
    }
}

async function buscarReservacionId(valorBusqueda){
    if(isNaN(valorBusqueda)) return;
    const urlBusqueda = URLReservaciones + '?id=' + valorBusqueda;

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaReservaciones(data.data);
    }
    catch(error){
        console.error('Error al buscar la reservación por ID:', error);
    }
}

async function buscarReservacionPorCliente(valorBusqueda){
    if(isNaN(valorBusqueda)) return;
    const urlBusqueda = URLReservaciones + '?id_cliente=' + valorBusqueda;

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaReservaciones(data.data);
    }
    catch(error){
        console.error('Error al buscar reservaciones por cliente:', error);
    }
}

async function buscarReservacionPorEstado(estado){
    const urlBusqueda = URLReservaciones + '?estado=' + estado;

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaReservaciones(data.data);
    }
    catch(error){
        console.error('Error al buscar reservaciones por estado:', error);
    }
}

function dibujarTablaReservaciones(dataReservaciones){
    const tabla = document.getElementById('tablaReservaciones');
    tabla.innerHTML = '';
    dataReservaciones.forEach(reservacion => {
        let fila = `<tr>
            <td scope="row">${reservacion.id}</td>
            <td>${reservacion.id_cliente}</td>
            <td>${reservacion.id_habitacion}</td>
            <td>${reservacion.fecha_entrada}</td>
            <td>${reservacion.fecha_salida}</td>
            <td>${reservacion.cantidad_personas}</td>
            <td>${reservacion.estado}</td>
            <td>${reservacion.total}</td>
            <td>${reservacion.usuario}</td>
            <td>
                <div class="container-fluid d-flex gap-2">
                    <button class="btn btn-sm btn-warning" type="button"
                    data-id="${reservacion.id}">
                        <i class="bi bi-brush-fill"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEliminarReservacion" data-id="${reservacion.id}">
                        <i class="bi bi-trash-fill"></i>Eliminar
                    </button>
                </div>
            </td>
        </tr>`;
        tabla.innerHTML += fila;
    });
    document.querySelectorAll('#tablaReservaciones .btn-warning').forEach(btn => {
        btn.addEventListener('click', evento => {
            const idReservacion = evento.currentTarget.dataset.id;
            abrirModalEditarReservacion(idReservacion);
        });
    });
    document.querySelectorAll('#tablaReservaciones .btn-danger').forEach(btn => {
        btn.addEventListener('click', evento => {
            idReservacionEliminar = evento.currentTarget.dataset.id;
        });
    });
}

async function agregarReservacion(reservacion){
    try{
        const response = await fetch(URLReservaciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservacion)
        });
        const data = await response.json();
        console.log(data);
        alert('Reservación agregada exitosamente');
        document.querySelector('#modalAgregarReservacion .btn-close').click();
        consultarReservaciones();
    }
    catch(error){
        console.error('Error al agregar la reservación:', error);
    }
}

async function abrirModalEditarReservacion(id) {
    try {
        const dataReservacion = await buscarReservacionIdInterno(id);
        idReservacionEditar = dataReservacion.id;
        document.getElementById('inputModalEditarReservacionIdClienteSeleccionado').value = dataReservacion.id_cliente;
        document.getElementById('inputModalEditarReservacionNombreClienteSeleccionado').value = '';
        document.getElementById('inputModalEditarReservacionIdHabitacionSeleccionado').value = dataReservacion.id_habitacion;
        document.getElementById('inputModalEditarReservacionNumHabitacionSeleccionado').value = '';
        document.getElementById('inputModalEditarReservacionFechaEntrada').value = dataReservacion.fecha_entrada;
        document.getElementById('inputModalEditarReservacionFechaSalida').value = dataReservacion.fecha_salida;
        document.getElementById('inputModalEditarReservacionCantidadPersonas').value = dataReservacion.cantidad_personas;
        document.getElementById('inputModalEditarReservacionEstado').value = dataReservacion.estado;
        document.getElementById('inputModalEditarReservacionTotal').value = dataReservacion.total;
        document.getElementById('inputModalEditarReservacionUsuario').value = dataReservacion.usuario;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarReservacion')).show();
    }
    catch(error) {
        alert('Error al cargar los datos de la reservación: ' + error.message);
        console.error(error);
    }
}

async function enviarDatosEditar() {
    const reservacionEditar = new Reservacion(
        idReservacionEditar,
        document.getElementById('inputModalEditarReservacionIdClienteSeleccionado').value,
        document.getElementById('inputModalEditarReservacionIdHabitacionSeleccionado').value,
        document.getElementById('inputModalEditarReservacionFechaEntrada').value,
        document.getElementById('inputModalEditarReservacionFechaSalida').value,
        document.getElementById('inputModalEditarReservacionCantidadPersonas').value,
        document.getElementById('inputModalEditarReservacionEstado').value,
        document.getElementById('inputModalEditarReservacionTotal').value,
        document.getElementById('inputModalEditarReservacionUsuario').value
    );

    try {
        const response = await fetch(URLReservaciones, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservacionEditar)
        });
        const data = await response.json();
        console.log(data);
        alert('Reservación editada exitosamente');
        document.getElementById('modalEditarReservacion').querySelector('.btn-close').click();
        consultarReservaciones();
    }
    catch(error) {
        console.error('Error al editar la reservación:', error);
    }
}

async function buscarReservacionIdInterno(id) {
    const urlBusqueda = URLReservaciones + '?id=' + id;
    try {
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        return data.data[0];
    }
    catch(error) {
        console.error('Error al buscar la reservación por ID:', error);
    }
}

async function eliminarReservacion(id) {
    try {
        const response = await fetch(URLReservaciones, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data);
        alert('Reservación eliminada exitosamente');
        consultarReservaciones();
    }
    catch(error) {
        console.error('Error al eliminar la reservación:', error);
    }
}

export async function consultarReservacionesExportar(){
    try {
        const response = await fetch(URLReservaciones, {
            method: 'GET'
        });
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.error('Error al consultar las reservaciones:', error);
    }
}

export function dibujarTablaReservacionesExportar(dataReservaciones, idTabla){
    const tabla = document.getElementById(idTabla);
    tabla.innerHTML = '';
    dataReservaciones.forEach(reservacion => {
        let fila = `<tr data-id="${reservacion.id}" data-info="${reservacion.estado}">
            <td>${reservacion.id}</td>
            <td>${reservacion.id_cliente}</td>
            <td>${reservacion.id_habitacion}</td>
            <td>${reservacion.fecha_entrada}</td>
            <td>${reservacion.fecha_salida}</td>
            <td>${reservacion.estado}</td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

export async function buscarReservacionesPorClienteExportar(idCliente){
    try {
        const response = await fetch(URLReservaciones + '?id_cliente=' + idCliente, {
            method: 'GET'
        });
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.error('Error al buscar reservaciones por cliente:', error);
    }
}
