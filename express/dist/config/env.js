import dotenv from "dotenv";
dotenv.config();
export const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE, PEMPATH } = process.env;
