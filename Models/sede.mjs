export default class Sede{
    constructor(id, id_hotel, nombre, pais, provincia, ciudad,
    direccion, telefono, correo, cantidad_habitaciones, 
    usuario){
        this.id = id;
        this.id_hotel = id_hotel;
        this.nombre = nombre;
        this.pais = pais;
        this.provincia = provincia;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.correo = correo;
        this.cantidad_habitaciones = cantidad_habitaciones;
        this.usuario = usuario;
    }
}