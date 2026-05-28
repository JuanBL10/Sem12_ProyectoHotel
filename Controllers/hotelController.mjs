import Hotel from '../Models/hotel.mjs';

const URL = "https://paginas-web-cr.com//Api/hotelApi/hotel/hotel.php";
const arrayHoteles = [];

document.addEventListener('DOMContentLoaded', () => {
    consultarHoteles();

    document.getElementById('formBusquedaHotel').addEventListener('submit', (evento) => {
        evento.preventDefault();
        buscarHotelIdNombre(formBusquedaHotel);
    });

    document.getElementById('botonCancelarBusqueda').addEventListener('click', (evento) => {
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
});

async function consultarHoteles(){
    //Copia de hoteles en array para el editar
    arrayHoteles = [];
    try {
        const response = await fetch(URL, {
            method: "GET"
        });
        const data = await response.json();
        console.log(data.data);
        arrayHoteles.push(data.data);
        dibujarTabla(data.data);
    }
    catch (error) {
        console.error('Error al consultar los hoteles:', error);
    }
}

async function buscarHotelIdNombre(form) {
    let valorBusqueda = form.barraBusquedaHoteles.value;
    let urlBusqueda = "";
    
    if (isNaN(valorBusqueda)) {
        //Busca por nombre
        urlBusqueda = URL + "?nombre=" + valorBusqueda;
    }
    else {
        //Busca por ID
        urlBusqueda = URL + "?id=" + valorBusqueda;
    }

    try{
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
                        data-bs-toggle="modal" data-bs-target="#modalEditarHotel"
                        onclick="abrirModalEditarHotel(${hotel.id}, '${hotel.nombre}', 
                        '${hotel.descripcion}', '${hotel.telefono}', 
                        '${hotel.correo}', '${hotel.sitio_web}', 
                        '${hotel.usuario}')">Editar</button>
                    </div>
                    <div class="row pt-1">
                        <button class="btn btn-danger btn-sm" onclick="eliminarHotel(${hotel.id})">Eliminar</button>
                    </div>
                </div>
            </td>
        </tr>`
        tabla.innerHTML += fila;
    });
}

async function enviarDatosAgregar(){
    const hotel = new Hotel(
        null,
        document.getElementById('nombreHotel').value,
        document.getElementById('descripcionHotel').value,
        document.getElementById('telefonoHotel').value,
        document.getElementById('correoHotel').value,
        document.getElementById('sitioWebHotel').value,
        document.getElementById('usuario').value
    );

    try{
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"},
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

function abrirModalEditarHotel(id, nombre, descripcion, telefono, correo, sitioWeb, usuario) {
    //Esto es para que se llene el modal con los datos existentes del hotel
    document.getElementById('idHotelEditar').value = id;
    document.getElementById('nombreHotelEditar').value = nombre;
    document.getElementById('descripcionHotelEditar').value = descripcion;
    document.getElementById('telefonoHotelEditar').value = telefono;
    document.getElementById('correoHotelEditar').value = correo;
    document.getElementById('sitioWebHotelEditar').value = sitioWeb;
    document.getElementById('usuarioEditar').value = usuario;
}

async function enviarDatosEditar(){
    const hotelEditar = new Hotel(
        document.getElementById('idHotelEditar').value,
        document.getElementById('nombreHotelEditar').value,
        document.getElementById('descripcionHotelEditar').value,
        document.getElementById('telefonoHotelEditar').value,
        document.getElementById('correoHotelEditar').value,
        document.getElementById('sitioWebHotelEditar').value,
        document.getElementById('usuarioEditar').value
    );

    try{
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"},
            body: JSON.stringify(hotelEditar)
        });
        const data = await response.json();
        console.log(data);
        alert("Hotel editado exitosamente");
        document.getElementById('modalEditarHotel').querySelector('.btn-close').click();
        consultarHoteles();
    }
    catch(error){
        console.error("Error al editar el hotel:", error);
    }
}