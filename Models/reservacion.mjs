/**
 * Clase que representa una reservación del sistema hotelero.
 * Se usa para estructurar los datos antes de enviarlos a la API.
 */
export default class Reservacion {
    /**
     * @param {number|null} id - ID de la reservación (null al crear una nueva).
     * @param {number} id_cliente - ID del cliente que realiza la reservación.
     * @param {number} id_habitacion - ID de la habitación reservada.
     * @param {string} fecha_entrada - Fecha de entrada (formato: YYYY-MM-DD).
     * @param {string} fecha_salida - Fecha de salida (formato: YYYY-MM-DD).
     * @param {number} cantidad_personas - Número de personas para la reservación.
     * @param {string} estado - Estado de la reservación (Pendiente, Confirmada, Cancelada, Finalizada).
     * @param {number} total - Costo total de la reservación.
     * @param {string} usuario - Usuario que registra o modifica la reservación.
     */
    constructor(id, id_cliente, id_habitacion, fecha_entrada, fecha_salida, cantidad_personas, estado, total, usuario) {
        this.id = id;
        this.id_cliente = id_cliente;
        this.id_habitacion = id_habitacion;
        this.fecha_entrada = fecha_entrada;
        this.fecha_salida = fecha_salida;
        this.cantidad_personas = cantidad_personas;
        this.estado = estado;
        this.total = total;
        this.usuario = usuario;
    }
}
