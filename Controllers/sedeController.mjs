import Sede from '../Models/sede.mjs';
import {consultarHotelesExportar, dibujarTablaExportar, URL} from './hotelController.mjs';

const URLSedes = 'https://paginas-web-cr.com/Api/hotelApi/sede/sede.php';
let temporizadorBusqueda;

document.addEventListener('DOMContentLoaded', () => {
    consultarSedes();

    //Eventos de barra de busqueda
    
    document.querySelector('#barraBusquedaSedes').addEventListener('input', evento => {
        clearTimeout(temporizadorBusqueda);

        if(evento.target.value.trim() == ''){
            consultarSedes();
            return;
        }

        temporizadorBusqueda = setTimeout(() => {buscarSedeIdNombre(evento.target.value.trim())}, 300);
    });

    document.getElementById('botonLimpiarBusquedaSedes').addEventListener('click', () => {
        document.querySelector('#barraBusquedaSedes').value = '';
        consultarSedes();
    });

    //Eventos de agregar sede

    document.getElementById('botonModalAgregarSedeBuscarHotel').addEventListener('click', async evento => {
        const data = await consultarHotelesExportar();
        dibujarTablaExportar(data, 'tablaHotelesEnModalAgregarSede');
    });

    document.getElementById('tablaHotelesEnModalAgregarSede').addEventListener('click', evento => {
        const filaSeleccionada = evento.target.closest('tr');
        const modalAgregarSede = new bootstrap.Modal(document.getElementById('modalAgregarSede'));
        if(filaSeleccionada == null){
            modalAgregarSede.show();
            return;
        }
        const idHotelSeleccionado = filaSeleccionada.getAttribute('data-id');
        document.getElementById('inputModalAgregarSedeIdHotelSeleccionado').value = idHotelSeleccionado;
        document.getElementById('modalAgregarSedeBuscarHotel').querySelector('.btn-close').click();
        
        modalAgregarSede.show();
    });

    //Implementar buscar en el modal de hoteles para agregar sede

    document.getElementById('formAgregarSede').addEventListener('submit', evento => {
        evento.preventDefault();
        const sede = new Sede(
            null,
            document.getElementById('inputModalAgregarSedeIdHotelSeleccionado').value,
            document.getElementById('inputModalAgregarSedeNombreSede').value,
            document.getElementById('inputModalAgregarSedePais').value,
            document.getElementById('inputModalAgregarSedeProvincia').value,
            document.getElementById('inputModalAgregarSedeCiudad').value,
            document.getElementById('inputModalAgregarSedeDireccion').value,
            document.getElementById('inputModalAgregarSedeTelefono').value,
            document.getElementById('inputModalAgregarSedeCorreo').value,
            document.getElementById('inputModalAgregarSedeNumHabitaciones').value,
            document.getElementById('inputModalAgregarSedeUsuario').value
        );
        agregarSede(sede);
    });

});

//Funciones para consultar sedes y dibujar la tabla de sedes

async function consultarSedes(){
    try {
        const response = await fetch(URLSedes, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaSedes(data.data);
    }
    catch (error) {
        console.error('Error al consultar las sedes:', error);
    }
}

async function buscarSedeIdNombre(valorBusqueda){
    let urlBusqueda = '';
    
    if(isNaN(valorBusqueda)){
        urlBusqueda = URLSedes + '?nombre=' + valorBusqueda;
    } else {
        urlBusqueda = URLSedes + '?id=' + valorBusqueda;
    }

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTablaSedes(data.data);
    }
    catch(error){
        console.error('Error al buscar la sede:', error);
    }
}

function dibujarTablaSedes(dataSedes){
    const tabla = document.getElementById('tablaSedes');
    tabla.innerHTML = '';
    dataSedes.forEach(sede => {
        let fila = `<tr>
            <td scope="row">${sede.id}</td>
            <td>${sede.id_hotel}</td>
            <td>${sede.nombre}</td>
            <td>${sede.pais}</td>
            <td>${sede.provincia}</td>
            <td>${sede.ciudad}</td>
            <td>${sede.direccion}</td>
            <td>${sede.telefono}</td>
            <td>${sede.correo}</td>
            <td>${sede.cantidad_habitaciones}</td>
            <td>${sede.usuario}</td>
            <td>
                <div class="container-fluid">
                    <button class="me-2 btn btn-sm btn-warning" type="button">
                        <i class="bi bi-brush-fill"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" type="button">
                        <i class="bi bi-trash-fill"></i>Eliminar
                    </button>
                </div>
            </td>
        </tr>`;
        tabla.innerHTML += fila;
    });
}

//Funciones para agregar sede
async function agregarSede(sede){
    try{
        const response = await fetch(URLSedes, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sede)
        });
        const data = await response.json();
        console.log(data);
        alert('Sede agregada exitosamente');
        document.querySelector('#modalAgregarSede .btn-close').click();
        consultarSedes();
    }
    catch(error){
        console.error('Error al agregar la sede:', error);
    }
}