import Habitacion from '../Models/habitacion.mjs';
import { consultarSedesExportar, dibujarTablaSedesExportar, URLSedes } from './sedeController.mjs';

const URLHabitaciones = 'https://paginas-web-cr.com/Api/hotelApi/habitacion/habitacion.php';

let temporizadorBusqueda;
let idHabitacionEliminar = -1;
let idHabitacionEditar = -1;
let idSedeHabitacionEditar = -1;
let mapaSedes = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('tablaHabitaciones') == null) return;
    await cargarMapaSedes();
    consultarHabitaciones();

    document.querySelector('#barraBusquedaHabitaciones').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        if (evento.target.value.trim() == '') {
            consultarHabitaciones();
            return;
        }
        temporizadorBusqueda = setTimeout(() => buscarHabitacionIdNombre(evento.target.value.trim()), 300);
    });

    document.getElementById('botonLimpiarBusquedaHabitaciones').addEventListener('click', () => {
        document.querySelector('#barraBusquedaHabitaciones').value = '';
        consultarHabitaciones();
    });

    document.getElementById('botonModalAgregarHabitacionBuscarSede').addEventListener('click', async () => {
        const data = await consultarSedesExportar();
        dibujarTablaSedesExportar(data, 'tablaSedesEnModalAgregarHabitacion');
    });

    document.getElementById('tablaSedesEnModalAgregarHabitacion').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if (filaSeleccionada == null) return;

        document.getElementById('inputModalAgregarHabitacionIdSedeSeleccionado').value = filaSeleccionada.getAttribute('data-id');
        document.getElementById('inputModalAgregarHabitacionNombreSedeSeleccionado').value = filaSeleccionada.dataset.nombre;

        document.getElementById('modalAgregarHabitacionBuscarSede').querySelector('.btn-close').click();
    });

    document.getElementById('modalAgregarHabitacionBuscarSede').addEventListener('hidden.bs.modal', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarHabitacion')).show();
    });

    document.getElementById('formAgregarHabitacion').addEventListener('submit', evento => {
        evento.preventDefault();
        const habitacion = new Habitacion(
            null,
            document.getElementById('inputModalAgregarHabitacionIdSedeSeleccionado').value,
            document.getElementById('inputModalAgregarHabitacionNumero').value,
            document.getElementById('inputModalAgregarHabitacionTipo').value,
            document.getElementById('inputModalAgregarHabitacionPrecio').value,
            document.getElementById('inputModalAgregarHabitacionEstado').value,
            document.getElementById('inputModalAgregarHabitacionCapacidad').value,
            document.getElementById('inputModalAgregarHabitacionDescripcion').value,
            document.getElementById('inputModalAgregarHabitacionUsuario').value
        );
        agregarHabitacion(habitacion);
    });

    document.querySelector('#modalEditarHabitacion .btn-close').addEventListener('click', () => {
        document.getElementById('formEditarHabitacion').reset();
    });

    document.querySelector('#modalEditarHabitacion .btn-secondary').addEventListener('click', () => {
        document.getElementById('formEditarHabitacion').reset();
    });

    document.getElementById('formEditarHabitacion').addEventListener('submit', evento => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    document.getElementById('modalEliminarHabitacion').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarHabitacion(idHabitacionEliminar);
        document.querySelector('#modalEliminarHabitacion .btn-close').click();
    });
});

async function cargarMapaSedes() {
    const data = await consultarSedesExportar();
    if (data) {
        mapaSedes = new Map(data.map(s => [String(s.id), s.nombre]));
    }
}

async function consultarHabitaciones() {
    try {
        const response = await fetch(URLHabitaciones, { method: 'GET' });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaHabitaciones(data.data ?? []);
    }
    catch (error) {
        console.error('Error al consultar las habitaciones:', error);
    }
}

async function buscarHabitacionIdNombre(valorBusqueda) {
    try {
        if (isNaN(valorBusqueda)) {
            const responseSede = await fetch(URLSedes + '?nombre=' + valorBusqueda, { method: 'GET' });
            const dataSede = await responseSede.json();
            console.log(dataSede.data);

            if (!dataSede.data || dataSede.data.length === 0) {
                dibujarTablaHabitaciones([]);
                return;
            }

            const sedes = Array.isArray(dataSede.data) ? dataSede.data : [dataSede.data];
            const promesas = sedes.map(s => fetch(URLHabitaciones + '?id_sede=' + s.id, { method: 'GET' }).then(r => r.json()));
            const resultados = await Promise.all(promesas);
            const todasHabitaciones = resultados.flatMap(r => Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []));
            console.log(todasHabitaciones);
            dibujarTablaHabitaciones(todasHabitaciones);
        } else {
            const response = await fetch(URLHabitaciones + '?id=' + valorBusqueda, { method: 'GET' });
            const data = await response.json();
            console.log(data.data);
            const resultado = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);
            dibujarTablaHabitaciones(resultado);
        }
    }
    catch (error) {
        console.error('Error al buscar la habitación:', error);
    }
}

function dibujarTablaHabitaciones(dataHabitaciones) {
    const tabla = document.getElementById('tablaHabitaciones');
    tabla.innerHTML = '';
    dataHabitaciones.forEach(habitacion => {
        const nombreSede = mapaSedes.get(String(habitacion.id_sede)) ?? habitacion.id_sede;
        let fila = `<tr>
            <td scope="row">${habitacion.id}</td>
            <td>${nombreSede}</td>
            <td>${habitacion.numero}</td>
            <td>${habitacion.tipo}</td>
            <td>${habitacion.precio}</td>
            <td>${habitacion.estado}</td>
            <td>${habitacion.capacidad}</td>
            <td>${habitacion.descripcion}</td>
            <td>${habitacion.usuario}</td>
            <td>
                <div class="container-fluid d-flex gap-2">
                    <button class="btn btn-sm btn-warning" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEditarHabitacion" data-id="${habitacion.id}">
                        <i class="bi bi-brush-fill"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEliminarHabitacion" data-id="${habitacion.id}">
                        <i class="bi bi-trash-fill"></i>Eliminar
                    </button>
                </div>
            </td>
        </tr>`;
        tabla.innerHTML += fila;
    });

    document.querySelectorAll('#tablaHabitaciones .btn-warning').forEach(btn => {
        btn.addEventListener('click', evento => {
            idHabitacionEditar = evento.currentTarget.dataset.id;
            abrirModalEditarHabitacion(idHabitacionEditar);
        });
    });

    document.querySelectorAll('#tablaHabitaciones .btn-danger').forEach(btn => {
        btn.addEventListener('click', evento => {
            idHabitacionEliminar = evento.currentTarget.dataset.id;
        });
    });
}

async function agregarHabitacion(habitacion) {
    try {
        const response = await fetch(URLHabitaciones, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitacion)
        });
        const data = await response.json();
        console.log(data);
        alert('Habitación agregada exitosamente');
        document.querySelector('#modalAgregarHabitacion .btn-close').click();
        consultarHabitaciones();
    }
    catch (error) {
        console.error('Error al agregar la habitación:', error);
    }
}

async function abrirModalEditarHabitacion(id) {
    try {
        const dataHabitacion = await buscarHabitacionId(id);
        idHabitacionEditar = dataHabitacion.id;
        idSedeHabitacionEditar = dataHabitacion.id_sede;
        document.getElementById('inputModalEditarHabitacionNumero').value = dataHabitacion.numero;
        document.getElementById('inputModalEditarHabitacionTipo').value = dataHabitacion.tipo;
        document.getElementById('inputModalEditarHabitacionPrecio').value = dataHabitacion.precio;
        document.getElementById('inputModalEditarHabitacionEstado').value = dataHabitacion.estado;
        document.getElementById('inputModalEditarHabitacionCapacidad').value = dataHabitacion.capacidad;
        document.getElementById('inputModalEditarHabitacionDescripcion').value = dataHabitacion.descripcion;
        document.getElementById('inputModalEditarHabitacionUsuario').value = dataHabitacion.usuario;
    }
    catch (error) {
        alert('Error al cargar los datos de la habitación: ' + error.message);
        console.error(error);
    }
}

async function enviarDatosEditar() {
    const habitacionEditar = new Habitacion(
        idHabitacionEditar,
        idSedeHabitacionEditar,
        document.getElementById('inputModalEditarHabitacionNumero').value,
        document.getElementById('inputModalEditarHabitacionTipo').value,
        document.getElementById('inputModalEditarHabitacionPrecio').value,
        document.getElementById('inputModalEditarHabitacionEstado').value,
        document.getElementById('inputModalEditarHabitacionCapacidad').value,
        document.getElementById('inputModalEditarHabitacionDescripcion').value,
        document.getElementById('inputModalEditarHabitacionUsuario').value
    );

    try {
        const response = await fetch(URLHabitaciones, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitacionEditar)
        });
        const data = await response.json();
        console.log(data);
        alert('Habitación editada exitosamente');
        document.getElementById('modalEditarHabitacion').querySelector('.btn-close').click();
        consultarHabitaciones();
    }
    catch (error) {
        console.error('Error al editar la habitación:', error);
    }
}

async function buscarHabitacionId(id) {
    const urlBusqueda = URLHabitaciones + '?id=' + id;
    try {
        const response = await fetch(urlBusqueda, { method: 'GET' });
        const data = await response.json();
        console.log(data.data);
        return data.data[0];
    }
    catch (error) {
        console.error('Error al buscar la habitación por ID:', error);
    }
}

export async function consultarHabitacionesExportar() {
    try {
        const response = await fetch(URLHabitaciones, { method: 'GET' });
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.error('Error al consultar las habitaciones:', error);
    }
}

export function dibujarTablaHabitacionesExportar(dataHabitaciones, idTabla) {
    const tabla = document.getElementById(idTabla);
    tabla.innerHTML = '';
    dataHabitaciones.forEach(habitacion => {
        let fila = `<tr data-id="${habitacion.id}" data-numero="${habitacion.numero}">
            <td>${habitacion.id}</td>
            <td>${habitacion.numero}</td>
            <td>${habitacion.tipo}</td>
            <td>${habitacion.precio}</td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

async function eliminarHabitacion(id) {
    try {
        const response = await fetch(URLHabitaciones, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data);
        alert('Habitación eliminada exitosamente');
        consultarHabitaciones();
    }
    catch (error) {
        console.error('Error al eliminar la habitación:', error);
    }
}
