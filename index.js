// Soluciones:
// He creado una clase en donde registro como métodos estáticos las funciones solicitadas para luego 
// controlar cuál método ejecutar en base a los comandos ingresados en la consola utilizando el siguiente código:

import Conexion from "./conexiones.js";

const argumentos = process.argv.slice(2);
const comando = argumentos[0];
const parametros = argumentos.slice(1);

const funciones = {
  dotransaction: Conexion.registerTransaction,
  consultatransferencias: Conexion.getLastTenTransactionFromCuenta,
  consultacuenta: Conexion.consultaCuenta,
};

if (comando) {
  funciones[comando](...parametros);
} else {
  console.log("Debes ingresar un comando");
}
