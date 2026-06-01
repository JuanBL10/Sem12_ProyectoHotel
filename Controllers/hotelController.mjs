import Hotel from '../Models/hotel.mjs';

export const URL = "https://paginas-web-cr.com//Api/hotelApi/hotel/hotel.php";
let idHotelEliminar = -1;
let temporizadorBusqueda;

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('tablaHoteles') == null){
        return;
    }
    
    consultarHoteles();

    document.getElementById('barraBusquedaHoteles').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);
        if(evento.target.value.trim() == ''){
            consultarHoteles();
            return;
        }
        temporizadorBusqueda = setTimeout(() => buscarHotelIdNombre(evento.target.value.trim()), 300);
    });

    document.getElementById('botonLimpiarBusqueda').addEventListener('click', (evento) => {
        document.getElementById('barraBusquedaHoteles').value = '';
        consultarHoteles();
    });

    document.getElementById('formAgregarHotel').addEventListener('submit', (evento) => {
        evento.preventDefault();
        enviarDatosAgregar();
    });

    document.querySelector('#modalAgregarHotel .btn-close').addEventListener('click', (evento) => {
        document.getElementById('formAgregarHotel').reset();
    });

    document.getElementById('botonCerrar').addEventListener('click', (evento) => {
        document.getElementById('formAgregarHotel').reset();
    });

    document.querySelector('#modalEditarHotel .btn-close').addEventListener('click', evento => {
        document.getElementById('formEditarHotel').reset();
    });

    document.querySelector('#modalEditarHotel .btn-secondary').addEventListener('click', evento => {
        document.getElementById('formEditarHotel').reset();
    });

    document.getElementById('formEditarHotel').addEventListener('submit', (evento) => {
        evento.preventDefault();
        enviarDatosEditar();
    });

    document.getElementById('modalEliminarHotel').querySelector('.btn-danger').addEventListener('click', () => {
        eliminarHotel(idHotelEliminar);
        console.log(idHotelEliminar);
        document.querySelector('#modalEliminarHotel .btn-close').click();
    });
});

async function consultarHoteles() {
    try {
        const response = await fetch(URL, {
            method: "GET"
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTabla(data.data);
    }
    catch (error) {
        console.error('Error al consultar los hoteles:', error);
    }
}

async function buscarHotelIdNombre(valorBusqueda) {
    let urlBusqueda = "";

    if (isNaN(valorBusqueda)) {
        //Busca por nombre
        urlBusqueda = URL + "?nombre=" + valorBusqueda;
    }
    else {
        //Busca por ID
        urlBusqueda = URL + "?id=" + valorBusqueda;
    }

    try {
        const response = await fetch(urlBusqueda, {
            method: "GET"
        });
        const data = await response.json();
        dibujarTabla(data.data);
    }
    catch (error) {
        console.error('Error al buscar el hotel:', error);
    }
}

function dibujarTabla(dataHoteles) {
    const tabla = document.getElementById('tablaHoteles');
    tabla.innerHTML = '';
    dataHoteles.forEach(hotel => {
        console.log(hotel);
        let fila =
            `<tr>
            <td>${hotel.id}</td>
            <td>${hotel.nombre}</td>
            <td>${hotel.descripcion}</td>
            <td>${hotel.telefono}</td>
            <td>${hotel.correo}</td>
            <td>${hotel.sitio_web}</td>
            <td>${hotel.usuario}</td>
            <td>
                <div class="container-fluid">
                    <div class="row pb-1">
                        <button type="button" class="btn btn-warning btn-sm"
                        data-bs-toggle="modal" data-bs-target="#modalEditarHotel" data-id="${hotel.id}"> <i class="bi bi-brush-fill"></i> Editar</button>
                    </div>
                    <div class="row pt-1">
                        <button class="btn btn-danger btn-sm" type="button"
                         data-bs-toggle="modal" data-bs-target="#modalEliminarHotel" data-id="${hotel.id}"> <i class="bi bi-trash-fill"></i> Eliminar</button>
                    </div>
                </div>
            </td>
        </tr>`
        tabla.innerHTML += fila;
    });
    document.querySelectorAll('.btn-warning').forEach(boton => {
        boton.addEventListener('click', (evento) => {
            const idHotel = evento.target.dataset.id;
            abrirModalEditarHotel(idHotel);
        });
    });
    document.querySelectorAll('.btn-danger').forEach(boton => {
        boton.addEventListener('click', evento => {
            idHotelEliminar = evento.target.dataset.id;
        });
    });
}

async function enviarDatosAgregar() {
    const hotel = new Hotel(
        null,
        document.getElementById('nombreHotel').value,
        document.getElementById('descripcionHotel').value,
        document.getElementById('telefonoHotel').value,
        document.getElementById('correoHotel').value,
        document.getElementById('sitioWebHotel').value,
        document.getElementById('usuario').value
    );

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(hotel)
        });
        const data = await response.json();
        console.log(data);
        alert("Hotel agregado exitosamente");
        document.getElementById('formAgregarHotel').reset();
        document.getElementById('modalAgregarHotel').querySelector('.btn-close').click();
        consultarHoteles();
    }
    catch (error) {
        console.error("Error al agregar el hotel:", error);
    }
}

async function abrirModalEditarHotel(id) {
    //Esto es para que se llene el modal con los datos existentes del hotel
    const dataHotel = await buscarHotelId(id);
    document.getElementById('idHotelEditar').value = dataHotel.id;
    document.getElementById('nombreHotelEditar').value = dataHotel.nombre;
    document.getElementById('descripcionHotelEditar').value = dataHotel.descripcion;
    document.getElementById('telefonoHotelEditar').value = dataHotel.telefono;
    document.getElementById('correoHotelEditar').value = dataHotel.correo;
    document.getElementById('sitioWebHotelEditar').value = dataHotel.sitio_web;
    document.getElementById('usuarioEditar').value = dataHotel.usuario;

}

async function enviarDatosEditar() {
    const hotelEditar = new Hotel(
        document.getElementById('idHotelEditar').value,
        document.getElementById('nombreHotelEditar').value,
        document.getElementById('descripcionHotelEditar').value,
        document.getElementById('telefonoHotelEditar').value,
        document.getElementById('correoHotelEditar').value,
        document.getElementById('sitioWebHotelEditar').value,
        document.getElementById('usuarioEditar').value
    );

    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(hotelEditar)
        });
        const data = await response.json();
        console.log(data);
        alert("Hotel editado exitosamente");
        document.getElementById('modalEditarHotel').querySelector('.btn-close').click();
        consultarHoteles();
    }
    catch (error) {
        console.error("Error al editar el hotel:", error);
    }
}

async function buscarHotelId(id) {
    const urlBusqueda = URL + "?id=" + id;
    try {
        const response = await fetch(urlBusqueda, {
            method: "GET"
        });
        const data = await response.json();
        console.log(data.data);
        return data.data[0];
    }
    catch (error) {
        console.error('Error al buscar el hotel por ID:', error);
    }
}

async function eliminarHotel(id) {
    try {
        const response = await fetch(URL, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });
        const data = await response.json();
        console.log(data);
        alert("Hotel eliminado exitosamente");
        consultarHoteles();
    }
    catch (error) {
        console.error("Error al eliminar el hotel:", error);
    }
}

//Funciones exportables en sedeController.mjs
export async function consultarHotelesExportar() {
    try {
        const response = await fetch(URL, {
            method: "GET"
        });
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.error('Error al consultar los hoteles:', error);
    }
}

export function dibujarTablaExportar(dataHoteles, idTabla) {
    const tabla = document.getElementById(idTabla);
    tabla.innerHTML = '';
    dataHoteles.forEach(hotel => {
        let fila =
        `<tr data-id="${hotel.id}">
            <td>${hotel.id}</td>
            <td>${hotel.nombre}</td>
        </tr>`
        tabla.innerHTML += fila;
    });
}