import pkg from "pg";
import "dotenv/config";
const { Pool } = pkg;
const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
} = process.env;

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}`;

const config = {
  connectionString: connectionString,
  idleTimeoutMillis: 0,
  allowExitOnIdle: true,
};

// Pregunta 1.Crear una función asíncrona que registre una nueva transferencia utilizando una transacción SQL. 
// Debe mostrar por consola la última transferencia registrada. (3 Puntos)

// He creado el siguiente método asíncrono que cumple lo pedido:
export default class Conexion {
  static async registerTransaction(cuentaOrigen, cuentaDestino, fecha, monto) {
    if (!cuentaOrigen || !cuentaDestino || !fecha || !monto) {
      console.log(
        "Debes introducir una cuenta origen, una cuenta destino, una fecha y un monto",
      );
    } else {
      const pool = new Pool(config);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const descontar = {
          text: "UPDATE cuentas SET saldo = saldo - $2 WHERE id=$1 RETURNING *",
          values: [cuentaOrigen, monto],
        };
        const resultadoDescontar = await client.query(descontar);
        if (resultadoDescontar.rowCount === 0) {
          throw new Error("La cuenta origen no existe");
        }
        const acreditar = {
          text: "UPDATE cuentas SET saldo = saldo + $2 WHERE id=$1 RETURNING *",
          values: [cuentaDestino, monto],
        };

        const resultadoAcreditar = await client.query(acreditar);
        if (resultadoAcreditar.rowCount === 0) {
          throw new Error("La cuenta destino no existe");
        }

        const transferencia = {
          text: "INSERT INTO transferencias (descripcion,fecha,m,cuenta_ontoorigen, cuenta_destino) VALUES ($1,$2,$3,$4,$5) RETURNING *",
          values: [
            `Transferencia entre ${cuentaOrigen} a ${cuentaDestino}`,
            fecha,
            monto,
            cuentaOrigen,
            cuentaDestino,
          ],
        };
        const transferenciaResult = await client.query(transferencia);
        console.log(transferenciaResult.rows[0]);

        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        console.log(e.message);
      } finally {
        client.release();
      }
    }
  }

// Pregunta 2.Realizar una función asíncrona que consulte la tabla de transferencias y retorne los últimos 10 registros de una cuenta en específico. (3 Puntos)

// He creado el siguiente método estático que cumple lo solicitado:
  static async getLastTenTransactionFromCuenta(cuenta) {
    if (!cuenta) {
      console.log("Debes introducir una cuenta");
    } else {
      const pool = new Pool(config);
      try {
        const consulta = {
          text: "SELECT * FROM transferencias WHERE cuenta_origen = $1 ORDER BY fecha desc LIMIT 10",
          values: [cuenta],
          rowMode: "array",
        };
        const result = await pool.query(consulta);
        console.log(result.rows);
        await pool.end();
      } catch (error) {
        console.log(error.message);
      }
    }
  }

// Pregunta 3.Realizar una función asíncrona que consulte el saldo de una cuenta en específico.(2 Puntos)

// He creado el siguiente método estático que cumple lo requerido:
  static async consultaCuenta(cuenta) {
    if (!cuenta) {
      console.log("Debes introducir una cuenta");
    } else {
      const pool = new Pool(config);
      try {
        const consulta = {
          text: "SELECT * FROM cuentas WHERE id = $1",
          values: [cuenta],
        };
        const result = await pool.query(consulta);
        if (result.rowCount === 0) {
          throw new Error("La cuenta no existe");
        }
        console.log(result.rows);
        await pool.end();
      } catch (error) {
        console.log(error.message);
      }
    }
  }
}

// Pregunta 4. En caso de haber un error en una transacción SQL, se debe retornar el error por consola. (2 Puntos)

// Como se puede observar en mis explicaciones anteriores y en el mismo código, 
// he manipulado los errores que se presentan al realizar las consultas mediante bloques try y catch y mediante condicionales.