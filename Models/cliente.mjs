/**
 * Clase que representa un cliente del sistema hotelero.
 * Se usa para estructurar los datos antes de enviarlos a la API.
 */
export default class Cliente {
    /**
     * @param {number|null} id - ID del cliente (null al crear uno nuevo).
     * @param {string} nombre - Nombre del cliente.
     * @param {string} apellidos - Apellidos del cliente.
     * @param {string} correo - Correo electrónico del cliente.
     * @param {string} telefono - Teléfono del cliente (formato: 0000-0000).
     * @param {string} identificacion - Número de identificación del cliente.
     * @param {string} usuario - Usuario que registra o modifica el cliente.
     */
    constructor(id, nombre, apellidos, correo, telefono, identificacion, usuario) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.correo = correo;
        this.telefono = telefono;
        this.identificacion = identificacion;
        this.usuario = usuario;
    }
}
