import Habitacion from '../Models/habitacion.mjs';
import { consultarSedesExportar, dibujarTablaSedesExportar } from './sedeController.mjs';

/** URL del endpoint de habitaciones en la API */
const URLHabitaciones = 'https://paginas-web-cr.com/Api/hotelApi/habitacion/habitacion.php';

let temporizadorBusqueda;
/** ID de la habitación a eliminar, se asigna al hacer click en el botón Eliminar */
let idHabitacionEliminar = -1;
/** ID de la habitación en edición, se asigna al abrir el modal de editar */
let idHabitacionEditar = -1;
/** Controla si el modal de búsqueda de sede fue abierto desde agregar o editar */
let modoModal = 'agregar';

document.addEventListener('DOMContentLoaded', () => {
    // Carga inicial de habitaciones al abrir la página
    consultarHabitaciones();

    // --- Barra de búsqueda ---

    // Búsqueda con debounce de 300ms: por ID si es número, por número de habitación si es texto
    document.querySelector('#barraBusquedaHabitaciones').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        if (evento.target.value.trim() == '') {
            consultarHabitaciones();
            return;
        }
        temporizadorBusqueda = setTimeout(() => buscarHabitacionIdNombre(evento.target.value.trim()), 300);
    });

    // Limpia la barra y recarga todas las habitaciones
    document.getElementById('botonLimpiarBusquedaHabitaciones').addEventListener('click', () => {
        document.querySelector('#barraBusquedaHabitaciones').value = '';
        consultarHabitaciones();
    });

    // --- Agregar habitación ---

    // Carga la lista de sedes en el modal de búsqueda y marca el modo 'agregar'
    document.getElementById('botonModalAgregarHabitacionBuscarSede').addEventListener('click', async () => {
        modoModal = 'agregar';
        const data = await consultarSedesExportar();
        dibujarTablaSedesExportar(data, 'tablaSedesEnModalAgregarHabitacion');
    });

    // Al seleccionar una sede: rellena los campos del modal correspondiente según modoModal
    document.getElementById('tablaSedesEnModalAgregarHabitacion').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if (filaSeleccionada == null) return;

        const idSedeSeleccionada = filaSeleccionada.getAttribute('data-id');
        const nombreSede = filaSeleccionada.dataset.nombre;

        // Cierra el modal de búsqueda de sede
        document.getElementById('modalAgregarHabitacionBuscarSede').querySelector('.btn-close').click();

        if (modoModal === 'editar') {
            document.getElementById('inputModalEditarHabitacionIdSedeSeleccionado').value = idSedeSeleccionada;
            document.getElementById('inputModalEditarHabitacionNombreSedeSeleccionado').value = nombreSede;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarHabitacion')).show();
        } else {
            document.getElementById('inputModalAgregarHabitacionIdSedeSeleccionado').value = idSedeSeleccionada;
            document.getElementById('inputModalAgregarHabitacionNombreSedeSeleccionado').value = nombreSede;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarHabitacion')).show();
        }
    });

    // Captura el submit del formulario de agregar y crea el objeto Habitacion
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

    // --- Editar habitación ---

    // Carga la lista de sedes en el modal de búsqueda y marca el modo 'editar'
    document.getElementById('botonModalEditarHabitacionBuscarSede').addEventListener('click', async () => {
        modoModal = 'editar';
        const data = await consultarSedesExportar();
        dibujarTablaSedesExportar(data, 'tablaSedesEnModalAgregarHabitacion');
    });

    // Resetea el formulario al cerrar el modal de editar con la X
    document.querySelector('#modalEditarHabitacion .btn-close').addEventListener('click', () => {
        document.getElementById('formEditarHabitacion').reset();
    });

    // Resetea el formulario al cerrar el modal de editar con el botón Cerrar
    document.querySelector('#modalEditarHabitacion .btn-secondary').addEventListener('click', () => {
        document.getElementById('formEditarHabitacion').reset();
    });

    // Captura el submit del formulario de editar
    document.getElementById('formEditarHabitacion').addEventListener('submit', evento => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    // --- Eliminar habitación ---

    // Confirma la eliminación al hacer click en el botón Eliminar del modal de confirmación
    document.getElementById('modalEliminarHabitacion').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarHabitacion(idHabitacionEliminar);
        document.querySelector('#modalEliminarHabitacion .btn-close').click();
    });
});

/**
 * Consulta todas las habitaciones en la API y dibuja la tabla.
 */
async function consultarHabitaciones() {
    try {
        const response = await fetch(URLHabitaciones, { method: 'GET' });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaHabitaciones(data.data);
    }
    catch (error) {
        console.error('Error al consultar las habitaciones:', error);
    }
}

/**
 * Busca habitaciones por ID (número) o por número de habitación (texto).
 * @param {string} valorBusqueda - Valor de la barra de búsqueda.
 */
async function buscarHabitacionIdNombre(valorBusqueda) {
    let urlBusqueda = '';

    if (isNaN(valorBusqueda)) {
        // Busca por número de habitación
        urlBusqueda = URLHabitaciones + '?numero=' + valorBusqueda;
    } else {
        // Busca por ID
        urlBusqueda = URLHabitaciones + '?id=' + valorBusqueda;
    }

    try {
        const response = await fetch(urlBusqueda, { method: 'GET' });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaHabitaciones(data.data);
    }
    catch (error) {
        console.error('Error al buscar la habitación:', error);
    }
}

/**
 * Renderiza las habitaciones en el tbody de la tabla.
 * Asigna los eventos a los botones Editar y Eliminar de cada fila.
 * @param {Array} dataHabitaciones - Arreglo de objetos habitación de la API.
 */
function dibujarTablaHabitaciones(dataHabitaciones) {
    const tabla = document.getElementById('tablaHabitaciones');
    tabla.innerHTML = '';
    dataHabitaciones.forEach(habitacion => {
        let fila = `<tr>
            <td scope="row">${habitacion.id}</td>
            <td>${habitacion.id_sede}</td>
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

    // Asigna el evento editar: guarda el ID y carga los datos en el formulario
    document.querySelectorAll('#tablaHabitaciones .btn-warning').forEach(btn => {
        btn.addEventListener('click', evento => {
            idHabitacionEditar = evento.currentTarget.dataset.id;
            abrirModalEditarHabitacion(idHabitacionEditar);
        });
    });

    // Asigna el evento eliminar: guarda el ID de la habitación seleccionada
    document.querySelectorAll('#tablaHabitaciones .btn-danger').forEach(btn => {
        btn.addEventListener('click', evento => {
            idHabitacionEliminar = evento.currentTarget.dataset.id;
        });
    });
}

/**
 * Envía una petición POST para crear una nueva habitación en la API.
 * @param {Habitacion} habitacion - Objeto con los datos del formulario de agregar.
 */
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

/**
 * Busca los datos de una habitación por ID y los carga en el formulario de edición.
 * @param {string} id - ID de la habitación a editar.
 */
async function abrirModalEditarHabitacion(id) {
    try {
        const dataHabitacion = await buscarHabitacionId(id);
        idHabitacionEditar = dataHabitacion.id;
        document.getElementById('inputModalEditarHabitacionIdSedeSeleccionado').value = dataHabitacion.id_sede;
        // El nombre de la sede se deja vacío; el usuario puede cambiarlo con el botón Seleccionar sede
        document.getElementById('inputModalEditarHabitacionNombreSedeSeleccionado').value = '';
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

/**
 * Recopila los datos del formulario de edición y envía una petición PUT a la API.
 */
async function enviarDatosEditar() {
    const habitacionEditar = new Habitacion(
        idHabitacionEditar,
        document.getElementById('inputModalEditarHabitacionIdSedeSeleccionado').value,
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

/**
 * Busca una habitación por su ID en la API.
 * @param {string} id - ID de la habitación.
 * @returns {Object} Objeto con los datos de la habitación.
 */
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

/**
 * Envía una petición DELETE para eliminar la habitación con el ID indicado.
 * @param {string} id - ID de la habitación a eliminar.
 */
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
