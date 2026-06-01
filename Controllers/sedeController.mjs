import Sede from '../Models/sede.mjs';

const URL = 'https://paginas-web-cr.com/Api/hotelApi/sede/sede.php';
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
    });;

});

//Funciones para consultar sedes y dibujar la tabla de sedes

async function consultarSedes(){
    try {
        const response = await fetch(URL, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTabla(data.data);
    }
    catch (error) {
        console.error('Error al consultar las sedes:', error);
    }
}

async function buscarSedeIdNombre(valorBusqueda){
    let urlBusqueda = '';
    
    if(isNaN(valorBusqueda)){
        urlBusqueda = URL + '?nombre=' + valorBusqueda;
    } else {
        urlBusqueda = URL + '?id=' + valorBusqueda;
    }

    try{
        const response = await fetch(urlBusqueda, {
            method: 'GET'
        });
        const data = await response.json();
        console.log(data.data);
        dibujarTabla(data.data);
    }
    catch(error){
        console.error('Error al buscar la sede:', error);
    }
}

function dibujarTabla(dataSedes){
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