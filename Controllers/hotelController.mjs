import Hotel from '../Models/hotel.mjs';

const URL = "https://paginas-web-cr.com//Api/hotelApi/hotel/hotel.php";

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
});

async function consultarHoteles(){
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
                        <button class="btn btn-warning btn-sm">Editar</button>
                    </div>
                    <div class="row pt-1">
                        <button class="btn btn-danger btn-sm">Eliminar</button>
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