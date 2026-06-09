/**
 * Clase que representa una habitación perteneciente a una sede hotelera.
 * Se usa para estructurar los datos antes de enviarlos a la API.
 * Nota: el campo 'fecha_creacion' lo genera automáticamente la API, no se incluye aquí.
 */
export default class Habitacion {
    /**
     * @param {number|null} id - ID de la habitación (null al crear una nueva).
     * @param {number} id_sede - ID de la sede a la que pertenece.
     * @param {string} numero - Número o identificador de la habitación (ej: "101").
     * @param {string} tipo - Tipo de habitación (ej: "Simple", "Doble", "Suite").
     * @param {number} precio - Precio por noche de la habitación.
     * @param {string} estado - Estado actual (ej: "Disponible", "Ocupada", "En mantenimiento").
     * @param {number} capacidad - Cantidad de personas que puede alojar la habitación.
     * @param {string} descripcion - Descripción general de la habitación.
     * @param {string} usuario - Usuario que registra o modifica la habitación.
     */
    constructor(id, id_sede, numero, tipo, precio, estado, capacidad, descripcion, usuario) {
        this.id = id;
        this.id_sede = id_sede;
        this.numero = numero;
        this.tipo = tipo;
        this.precio = precio;
        this.estado = estado;
        this.capacidad = capacidad;
        this.descripcion = descripcion;
        this.usuario = usuario;
    }
}
