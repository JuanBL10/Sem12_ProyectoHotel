import Habitacion from '../Models/habitacion.mjs';
import { consultarSedesExportar, dibujarTablaSedesExportar, URLSedes } from './sedeController.mjs';

/** URL del endpoint de habitaciones en la API */
const URLHabitaciones = 'https://paginas-web-cr.com/Api/hotelApi/habitacion/habitacion.php';

let temporizadorBusqueda;
/** ID de la habitación a eliminar, se asigna al hacer click en el botón Eliminar */
let idHabitacionEliminar = -1;
/** ID de la habitación en edición, se asigna al abrir el modal de editar */
let idHabitacionEditar = -1;
/** ID de sede de la habitación en edición, no se puede modificar desde el form */
let idSedeHabitacionEditar = -1;
/** Mapa de id_sede → nombre, se carga al inicio para mostrar nombres en la tabla */
let mapaSedes = new Map();

document.addEventListener('DOMContentLoaded', async () => {
    // Carga el mapa de sedes antes de dibujar la tabla
    await cargarMapaSedes();
    consultarHabitaciones();

    // --- Barra de búsqueda ---

    // Búsqueda con debounce de 300ms: por ID si es número, por nombre de sede si es texto
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

    // Carga la lista de sedes en el modal de búsqueda
    document.getElementById('botonModalAgregarHabitacionBuscarSede').addEventListener('click', async () => {
        const data = await consultarSedesExportar();
        dibujarTablaSedesExportar(data, 'tablaSedesEnModalAgregarHabitacion');
    });

    // Al seleccionar una sede: rellena los campos del modal agregar y cierra el de búsqueda
    document.getElementById('tablaSedesEnModalAgregarHabitacion').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        if (filaSeleccionada == null) return;

        document.getElementById('inputModalAgregarHabitacionIdSedeSeleccionado').value = filaSeleccionada.getAttribute('data-id');
        document.getElementById('inputModalAgregarHabitacionNombreSedeSeleccionado').value = filaSeleccionada.dataset.nombre;

        // Cierra el modal de búsqueda; hidden.bs.modal re-abre el modal de agregar
        document.getElementById('modalAgregarHabitacionBuscarSede').querySelector('.btn-close').click();
    });

    // Re-abre el modal de agregar una vez que el modal de búsqueda termina de cerrarse
    document.getElementById('modalAgregarHabitacionBuscarSede').addEventListener('hidden.bs.modal', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAgregarHabitacion')).show();
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
 * Carga todas las sedes y construye un mapa id → nombre para usarlo en la tabla.
 */
async function cargarMapaSedes() {
    const data = await consultarSedesExportar();
    if (data) {
        mapaSedes = new Map(data.map(s => [String(s.id), s.nombre]));
    }
}

/**
 * Consulta todas las habitaciones en la API y dibuja la tabla.
 */
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

/**
 * Busca habitaciones por ID de habitación (número) o por nombre de sede (texto).
 * Si es texto: busca la sede por nombre, obtiene su ID y filtra habitaciones por id_sede.
 * @param {string} valorBusqueda - Valor de la barra de búsqueda.
 */
async function buscarHabitacionIdNombre(valorBusqueda) {
    try {
        if (isNaN(valorBusqueda)) {
            // Busca la sede por nombre y obtiene su ID
            const responseSede = await fetch(URLSedes + '?nombre=' + valorBusqueda, { method: 'GET' });
            const dataSede = await responseSede.json();
            console.log(dataSede.data);

            if (!dataSede.data || dataSede.data.length === 0) {
                dibujarTablaHabitaciones([]);
                return;
            }

            // Filtra habitaciones por el ID de la primera sede encontrada
            const idSede = dataSede.data[0].id;
            const responseHabitaciones = await fetch(URLHabitaciones + '?id_sede=' + idSede, { method: 'GET' });
            const dataHabitaciones = await responseHabitaciones.json();
            console.log(dataHabitaciones.data);
            dibujarTablaHabitaciones(dataHabitaciones.data ?? []);
        } else {
            // Busca por ID de habitación
            const response = await fetch(URLHabitaciones + '?id=' + valorBusqueda, { method: 'GET' });
            const data = await response.json();
            console.log(data.data);
            dibujarTablaHabitaciones(data.data ?? []);
        }
    }
    catch (error) {
        console.error('Error al buscar la habitación:', error);
    }
}

/**
 * Renderiza las habitaciones en el tbody de la tabla.
 * Usa mapaSedes para mostrar el nombre de la sede en lugar del ID.
 * Asigna los eventos a los botones Editar y Eliminar de cada fila.
 * @param {Array} dataHabitaciones - Arreglo de objetos habitación de la API.
 */
function dibujarTablaHabitaciones(dataHabitaciones) {
    const tabla = document.getElementById('tablaHabitaciones');
    tabla.innerHTML = '';
    dataHabitaciones.forEach(habitacion => {
        // Obtiene el nombre de la sede desde el mapa; si no existe muestra el ID
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
 * La sede no se puede cambiar desde el formulario; se guarda en idSedeHabitacionEditar.
 * @param {string} id - ID de la habitación a editar.
 */
async function abrirModalEditarHabitacion(id) {
    try {
        const dataHabitacion = await buscarHabitacionId(id);
        idHabitacionEditar = dataHabitacion.id;
        // La sede se guarda en variable, no en el formulario, ya que no se puede cambiar
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

/**
 * Recopila los datos del formulario de edición y envía una petición PUT a la API.
 * Usa idSedeHabitacionEditar para mantener la sede original de la habitación.
 */
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
