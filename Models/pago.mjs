/**
 * Clase que representa un pago del sistema hotelero.
 * Se usa para estructurar los datos antes de enviarlos a la API.
 */
export default class Pago {
    /**
     * @param {number|null} id - ID del pago (null al crear uno nuevo).
     * @param {number} id_reservacion - ID de la reservación asociada al pago.
     * @param {number} monto - Monto del pago.
     * @param {string} metodo - Método de pago (Tarjeta, Efectivo, Transferencia, SINPE).
     * @param {string} detalle - Detalle o descripción del pago.
     * @param {string} estado - Estado del pago (Pendiente, Completado, Cancelado).
     * @param {string} fecha_pago - Fecha y hora del pago (formato: YYYY-MM-DD HH:MM:SS).
     * @param {string} usuario - Usuario que registra o modifica el pago.
     */
    constructor(id, id_reservacion, monto, metodo, detalle, estado, fecha_pago, usuario) {
        this.id = id;
        this.id_reservacion = id_reservacion;
        this.monto = monto;
        this.metodo = metodo;
        this.detalle = detalle;
        this.estado = estado;
        this.fecha_pago = fecha_pago;
        this.usuario = usuario;
    }
}
