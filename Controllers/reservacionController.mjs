import Reservacion from '../Models/reservacion.mjs';

const URLReservaciones = 'https://paginas-web-cr.com/Api/hotelApi/reservacion/reservacion.php';
let temporizadorBusqueda;
let idReservacionEliminar = -1;
let idReservacionEditar = -1;

document.addEventListener('DOMContentLoaded', () => {
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
                    data-bs-toggle="modal" data-bs-target="#modalEditarReservacion" data-id="${reservacion.id}">
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
