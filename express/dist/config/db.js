import * as fs from "fs";
import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE, PEMPATH } from "./env.js";
import pkg from "pg";
const { Pool } = pkg;
export const pool = new Pool({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: PGPORT ? parseInt(PGPORT) : 5432,
    ssl: {
        ca: fs.readFileSync(PEMPATH ? PEMPATH : ""),
        rejectUnauthorized: false,
    },
});
