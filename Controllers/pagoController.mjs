import Pago from '../Models/pago.mjs';
import { consultarReservacionesExportar, dibujarTablaReservacionesExportar } from './reservacionController.mjs';

const URLPagos = 'https://paginas-web-cr.com/Api/hotelApi/pago/pago.php';
let temporizadorBusqueda;
let idPagoEliminar = -1;
let idPagoEditar = -1;

document.addEventListener('DOMContentLoaded', () => {
    consultarPagos();

    // Barra ID pago
    document.querySelector('#barraBusquedaPagos').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        document.getElementById('barraBusquedaPagosPorReservacion').value = '';

        if(evento.target.value.trim() == ''){
            consultarPagos();
            return;
        }

        temporizadorBusqueda = setTimeout(() => {buscarPagoId(evento.target.value.trim())}, 300);
    });

    document.getElementById('botonLimpiarBusquedaPagos').addEventListener('click', () => {
        document.querySelector('#barraBusquedaPagos').value = '';
        consultarPagos();
    });

    // Barra ID reservación
    document.querySelector('#barraBusquedaPagosPorReservacion').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        document.getElementById('barraBusquedaPagos').value = '';

        if(evento.target.value.trim() == ''){
            consultarPagos();
            return;
        }

        temporizadorBusqueda = setTimeout(() => {buscarPagoPorReservacion(evento.target.value.trim())}, 300);
    });

    document.getElementById('botonLimpiarBusquedaPagosPorReservacion').addEventListener('click', () => {
        document.querySelector('#barraBusquedaPagosPorReservacion').value = '';
        consultarPagos();
    });

    // --- Agregar pago ---

    document.getElementById('botonModalAgregarPagoBuscarReservacion').addEventListener('click', async () => {
        const data = await consultarReservacionesExportar();
        dibujarTablaReservacionesExportar(data, 'tablaReservacionesEnModalPago');
    });

    document.getElementById('tablaReservacionesEnModalPago').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if(filaSeleccionada == null) return;

        const idReservacion = filaSeleccionada.getAttribute('data-id');
        const infoReservacion = filaSeleccionada.dataset.info;

        document.getElementById('modalPagoBuscarReservacion').querySelector('.btn-close').click();

        document.getElementById('inputModalAgregarPagoIdReservacionSeleccionado').value = idReservacion;
        document.getElementById('inputModalAgregarPagoInfoReservacionSeleccionado').value = infoReservacion;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarPago')).show();
    });

    document.querySelector('#modalAgregarPago .btn-close').addEventListener('click', () => {
        document.getElementById('formAgregarPago').reset();
    });

    document.querySelector('#modalAgregarPago .btn-secondary').addEventListener('click', () => {
        document.getElementById('formAgregarPago').reset();
    });

    document.getElementById('formAgregarPago').addEventListener('submit', evento => {
        evento.preventDefault();
        const pago = new Pago(
            null,
            document.getElementById('inputModalAgregarPagoIdReservacionSeleccionado').value,
            document.getElementById('inputModalAgregarPagoMonto').value,
            document.getElementById('inputModalAgregarPagoMetodo').value,
            document.getElementById('inputModalAgregarPagoDetalle').value,
            document.getElementById('inputModalAgregarPagoEstado').value,
            document.getElementById('inputModalAgregarPagoFechaPago').value,
            document.getElementById('inputModalAgregarPagoUsuario').value
        );
        agregarPago(pago);
    });

    // --- Editar pago ---

    document.querySelector('#modalEditarPago .btn-close').addEventListener('click', () => {
        document.getElementById('formEditarPago').reset();
    });

    document.querySelector('#modalEditarPago .btn-secondary').addEventListener('click', () => {
        document.getElementById('formEditarPago').reset();
    });

    document.getElementById('formEditarPago').addEventListener('submit', evento => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    // --- Eliminar pago ---

    document.getElementById('modalEliminarPago').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarPago(idPagoEliminar);
        document.querySelector('#modalEliminarPago .btn-close').click();
    });
});

async function consultarPagos(){
    try {
        const response = await fetch(URLPagos, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaPagos(data.data);
    }
    catch (error) {
        console.error('Error al consultar los pagos:', error);
    }
}

async function buscarPagoId(valorBusqueda){
    if(isNaN(valorBusqueda)) return;
    const urlBusqueda = URLPagos + '?id=' + valorBusqueda;

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaPagos(data.data);
    }
    catch(error){
        console.error('Error al buscar el pago por ID:', error);
    }
}

async function buscarPagoPorReservacion(valorBusqueda){
    if(isNaN(valorBusqueda)) return;
    const urlBusqueda = URLPagos + '?id_reservacion=' + valorBusqueda;

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaPagos(data.data);
    }
    catch(error){
        console.error('Error al buscar pagos por reservación:', error);
    }
}

function dibujarTablaPagos(dataPagos){
    const tabla = document.getElementById('tablaPagos');
    tabla.innerHTML = '';
    dataPagos.forEach(pago => {
        let fila = `<tr>
            <td scope="row">${pago.id}</td>
            <td>${pago.id_reservacion}</td>
            <td>${pago.monto}</td>
            <td>${pago.metodo}</td>
            <td>${pago.detalle}</td>
            <td>${pago.estado}</td>
            <td>${pago.fecha_pago}</td>
            <td>${pago.usuario}</td>
            <td>
                <div class="container-fluid d-flex gap-2">
                    <button class="btn btn-sm btn-warning" type="button"
                    data-id="${pago.id}">
                        <i class="bi bi-brush-fill"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEliminarPago" data-id="${pago.id}">
                        <i class="bi bi-trash-fill"></i>Eliminar
                    </button>
                </div>
            </td>
        </tr>`;
        tabla.innerHTML += fila;
    });
    document.querySelectorAll('#tablaPagos .btn-warning').forEach(btn => {
        btn.addEventListener('click', evento => {
            const idPago = evento.currentTarget.dataset.id;
            abrirModalEditarPago(idPago);
        });
    });
    document.querySelectorAll('#tablaPagos .btn-danger').forEach(btn => {
        btn.addEventListener('click', evento => {
            idPagoEliminar = evento.currentTarget.dataset.id;
        });
    });
}

async function agregarPago(pago){
    try{
        const response = await fetch(URLPagos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pago)
        });
        const data = await response.json();
        console.log(data);
        alert('Pago agregado exitosamente');
        document.querySelector('#modalAgregarPago .btn-close').click();
        consultarPagos();
    }
    catch(error){
        console.error('Error al agregar el pago:', error);
    }
}

async function abrirModalEditarPago(id) {
    try {
        const dataPago = await buscarPagoIdInterno(id);
        idPagoEditar = dataPago.id;
        document.getElementById('inputModalEditarPagoIdReservacionSeleccionado').value = dataPago.id_reservacion;
        document.getElementById('inputModalEditarPagoInfoReservacionSeleccionado').value = '';
        document.getElementById('inputModalEditarPagoMonto').value = dataPago.monto;
        document.getElementById('inputModalEditarPagoMetodo').value = dataPago.metodo;
        document.getElementById('inputModalEditarPagoDetalle').value = dataPago.detalle;
        document.getElementById('inputModalEditarPagoEstado').value = dataPago.estado;
        document.getElementById('inputModalEditarPagoFechaPago').value = dataPago.fecha_pago;
        document.getElementById('inputModalEditarPagoUsuario').value = dataPago.usuario;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarPago')).show();
    }
    catch(error) {
        alert('Error al cargar los datos del pago: ' + error.message);
        console.error(error);
    }
}

async function enviarDatosEditar() {
    const pagoEditar = new Pago(
        idPagoEditar,
        document.getElementById('inputModalEditarPagoIdReservacionSeleccionado').value,
        document.getElementById('inputModalEditarPagoMonto').value,
        document.getElementById('inputModalEditarPagoMetodo').value,
        document.getElementById('inputModalEditarPagoDetalle').value,
        document.getElementById('inputModalEditarPagoEstado').value,
        document.getElementById('inputModalEditarPagoFechaPago').value,
        document.getElementById('inputModalEditarPagoUsuario').value
    );

    try {
        const response = await fetch(URLPagos, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pagoEditar)
        });
        const data = await response.json();
        console.log(data);
        alert('Pago editado exitosamente');
        document.getElementById('modalEditarPago').querySelector('.btn-close').click();
        consultarPagos();
    }
    catch(error) {
        console.error('Error al editar el pago:', error);
    }
}

async function buscarPagoIdInterno(id) {
    const urlBusqueda = URLPagos + '?id=' + id;
    try {
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        return data.data[0];
    }
    catch(error) {
        console.error('Error al buscar el pago por ID:', error);
    }
}

async function eliminarPago(id) {
    try {
        const response = await fetch(URLPagos, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data);
        alert('Pago eliminado exitosamente');
        consultarPagos();
    }
    catch(error) {
        console.error('Error al eliminar el pago:', error);
    }
}
