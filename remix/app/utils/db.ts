// import pkg from "pg";
// import dotenv from "dotenv";

// dotenv.config();
// const { Pool } = pkg;
// const pool = new Pool({
//   host: process.env.DATABASE_HOST,
//   port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
// });

// pool.on("error", (err) => {
//   console.error("Unexpected error on idle client", err);
//   process.exit(-1);
// });

// export const query = async (text: string, params?: any) => {
//   // const client = await pool.connect();
//   // try {
//   //   const res = await client.query(text, params);
//   //   return res;
//   // } catch (err) {
//   //   console.error("Error executing query", err);
//   //   throw err;
//   // } finally {
//   //   client.release();
//   // }
// };
