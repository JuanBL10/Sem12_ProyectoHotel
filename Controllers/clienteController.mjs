import Cliente from '../Models/cliente.mjs';

const URLClientes = 'https://paginas-web-cr.com/Api/hotelApi/cliente/cliente.php';

let temporizadorBusqueda;
let idClienteEliminar = -1;
let idClienteEditar = -1;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tablaClientes') == null) return;
    consultarClientes();

    document.querySelector('#barraBusquedaClientes').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        if (evento.target.value.trim() == '') {
            consultarClientes();
            return;
        }
        temporizadorBusqueda = setTimeout(() => buscarClienteIdNombre(evento.target.value.trim()), 300);
    });

    document.getElementById('botonLimpiarBusquedaClientes').addEventListener('click', () => {
        document.querySelector('#barraBusquedaClientes').value = '';
        consultarClientes();
    });

    document.getElementById('formAgregarCliente').addEventListener('submit', evento => {
        evento.preventDefault();
        const cliente = new Cliente(
            null,
            document.getElementById('inputNombreCliente').value,
            document.getElementById('inputApellidosCliente').value,
            document.getElementById('inputCorreoCliente').value,
            document.getElementById('inputTelefonoCliente').value,
            document.getElementById('inputIdentificacionCliente').value,
            document.getElementById('inputUsuarioCliente').value
        );
        agregarCliente(cliente);
    });

    document.querySelector('#modalAgregarCliente .btn-close').addEventListener('click', () => {
        document.getElementById('formAgregarCliente').reset();
    });

    document.querySelector('#modalAgregarCliente .btn-secondary').addEventListener('click', () => {
        document.getElementById('formAgregarCliente').reset();
    });

    document.querySelector('#modalEditarCliente .btn-close').addEventListener('click', () => {
        document.getElementById('formEditarCliente').reset();
    });

    document.querySelector('#modalEditarCliente .btn-secondary').addEventListener('click', () => {
        document.getElementById('formEditarCliente').reset();
    });

    document.getElementById('formEditarCliente').addEventListener('submit', evento => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    document.getElementById('modalEliminarCliente').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarCliente(idClienteEliminar);
        document.querySelector('#modalEliminarCliente .btn-close').click();
    });
});

async function consultarClientes() {
    try {
        const response = await fetch(URLClientes, { method: 'GET' });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaClientes(data.data);
    }
    catch (error) {
        console.error('Error al consultar los clientes:', error);
    }
}

async function buscarClienteIdNombre(valorBusqueda) {
    try {
        const response = await fetch(URLClientes, { method: 'GET' });
        const data = await response.json();
        const clientes = data.data ?? [];

        let resultado;
        if (!isNaN(valorBusqueda)) {
            resultado = clientes.filter(c => String(c.id) === valorBusqueda);
        } else {
            const busqueda = valorBusqueda.toLowerCase();
            resultado = clientes.filter(c =>
                (c.nombre ?? '').toLowerCase().includes(busqueda) ||
                (c.apellidos ?? '').toLowerCase().includes(busqueda)
            );
        }

        dibujarTablaClientes(resultado);
    }
    catch (error) {
        console.error('Error al buscar el cliente:', error);
    }
}

function dibujarTablaClientes(dataClientes) {
    const tabla = document.getElementById('tablaClientes');
    tabla.innerHTML = '';
    (dataClientes ?? []).forEach(cliente => {
        let fila = `<tr>
            <td scope="row">${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.apellidos}</td>
            <td>${cliente.correo}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.identificacion}</td>
            <td>${cliente.usuario}</td>
            <td>
                <div class="container-fluid d-flex gap-2">
                    <button class="btn btn-sm btn-warning" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEditarCliente" data-id="${cliente.id}">
                        <i class="bi bi-brush-fill"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" type="button"
                    data-bs-toggle="modal" data-bs-target="#modalEliminarCliente" data-id="${cliente.id}">
                        <i class="bi bi-trash-fill"></i>Eliminar
                    </button>
                </div>
            </td>
        </tr>`;
        tabla.innerHTML += fila;
    });

    document.querySelectorAll('#tablaClientes .btn-warning').forEach(btn => {
        btn.addEventListener('click', evento => {
            const idCliente = evento.currentTarget.dataset.id;
            abrirModalEditarCliente(idCliente);
        });
    });

    document.querySelectorAll('#tablaClientes .btn-danger').forEach(btn => {
        btn.addEventListener('click', evento => {
            idClienteEliminar = evento.currentTarget.dataset.id;
            console.log('Eliminar cliente ID:', idClienteEliminar);
        });
    });
}

async function agregarCliente(cliente) {
    try {
        const response = await fetch(URLClientes, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });
        const data = await response.json();
        console.log(data);
        alert('Cliente agregado exitosamente');
        document.querySelector('#modalAgregarCliente .btn-close').click();
        consultarClientes();
    }
    catch (error) {
        console.error('Error al agregar el cliente:', error);
        alert('Error al agregar el cliente: ' + error.message);
    }
}

async function abrirModalEditarCliente(id) {
    try {
        const dataCliente = await buscarClienteId(id);
        if (!dataCliente) {
            alert('No se encontraron datos para el cliente con ID ' + id);
            return;
        }
        idClienteEditar = dataCliente.id;
        document.getElementById('inputNombreClienteEditar').value = dataCliente.nombre;
        document.getElementById('inputApellidosClienteEditar').value = dataCliente.apellidos;
        document.getElementById('inputCorreoClienteEditar').value = dataCliente.correo;
        document.getElementById('inputTelefonoClienteEditar').value = dataCliente.telefono;
        document.getElementById('inputIdentificacionClienteEditar').value = dataCliente.identificacion;
        document.getElementById('inputUsuarioClienteEditar').value = dataCliente.usuario;
    }
    catch (error) {
        alert('Error al cargar los datos del cliente: ' + error.message);
        console.error(error);
    }
}

async function enviarDatosEditar() {
    console.log('Enviando edición de cliente ID:', idClienteEditar);
    const clienteEditar = new Cliente(
        idClienteEditar,
        document.getElementById('inputNombreClienteEditar').value,
        document.getElementById('inputApellidosClienteEditar').value,
        document.getElementById('inputCorreoClienteEditar').value,
        document.getElementById('inputTelefonoClienteEditar').value,
        document.getElementById('inputIdentificacionClienteEditar').value,
        document.getElementById('inputUsuarioClienteEditar').value
    );
    console.log('Datos a enviar:', JSON.stringify(clienteEditar));

    try {
        const response = await fetch(URLClientes, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteEditar)
        });
        const data = await response.json();
        console.log(data);
        alert('Cliente editado exitosamente');
        document.getElementById('modalEditarCliente').querySelector('.btn-close').click();
        consultarClientes();
    }
    catch (error) {
        console.error('Error al editar el cliente:', error);
        alert('Error al editar el cliente: ' + error.message);
    }
}

async function buscarClienteId(id) {
    try {
        const response = await fetch(URLClientes, { method: 'GET' });
        const data = await response.json();
        const clientes = data.data ?? [];
        return clientes.find(c => String(c.id) === String(id));
    }
    catch (error) {
        console.error('Error al buscar el cliente por ID:', error);
    }
}

export async function consultarClientesExportar() {
    try {
        const response = await fetch(URLClientes, { method: 'GET' });
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.error('Error al consultar los clientes:', error);
    }
}

export function dibujarTablaClientesExportar(dataClientes, idTabla) {
    const tabla = document.getElementById(idTabla);
    tabla.innerHTML = '';
    dataClientes.forEach(cliente => {
        let fila = `<tr data-id="${cliente.id}" data-nombre="${cliente.nombre}">
            <td>${cliente.id}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.apellidos}</td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

async function eliminarCliente(id) {
    console.log('Eliminando cliente ID:', id);
    try {
        const response = await fetch(URLClientes, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data);
        alert('Cliente eliminado exitosamente');
        consultarClientes();
    }
    catch (error) {
        console.error('Error al eliminar el cliente:', error);
        alert('Error al eliminar el cliente: ' + error.message);
    }
}
