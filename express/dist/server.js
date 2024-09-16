/** @format */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import { CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, LOCK_RECORD, SAVE_RECORD, USER_JOINED, UNLOCK_RECORD, SCHEDULING_ROOM_ID, PORT, ARCHIVE_ROOM_ID, KEY_OF_SERVER_TREATMENT, KEY_OF_SERVER_PRECORD, CONNECTED_USERS, CONNECTION, } from "shared";
import { deconstructRecord, lockOrUnlockRowsQuery, setUserSessionQuery, deconstructTreatement, updateQuery } from "./utils.js";
import { TREATMENTS } from "./contants.js";
dotenv.config();
const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE, PEMPATH } = process.env;
const { Pool } = pkg;
const pool = new Pool({
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
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
    path: "/socket",
});
const roomUsers = {};
roomUsers[SCHEDULING_ROOM_ID] = {};
roomUsers[ARCHIVE_ROOM_ID] = {};
io.on(CONNECTION, (socket) => {
    socket.on(JOIN_ROOM, ({ userId, username, roomId }) => {
        socket.join(roomId);
        if (!(roomId in roomUsers)) {
            roomUsers[roomId] = { [userId]: username };
        }
        if (!(userId in roomUsers[roomId])) {
            roomUsers[roomId][userId] = username;
            socket.broadcast.to(roomId).emit(USER_JOINED, userId);
        }
        io.in(roomId).emit(CONNECTED_USERS, Object.keys(roomUsers[roomId]));
    });
    socket.on(LOCK_RECORD, ({ recordId, locker, isLocked, tableType, roomId }) => {
        socket.broadcast.to(roomId).emit(LOCK_RECORD, { recordId, locker, isLocked, tableType });
    });
    socket.on(DELETE_RECORD, ({ recordIds, tableType, roomId }) => {
        socket.broadcast.to(roomId).emit(DELETE_RECORD, { recordIds, tableType });
    });
    socket.on(SAVE_RECORD, ({ records, tableType, roomId, propertyName, newValue }) => {
        socket.broadcast.to(roomId).emit(SAVE_RECORD, { records, tableType, propertyName, newValue });
    });
    socket.on(UNLOCK_RECORD, ({ recordId, tableType, roomId }) => {
        socket.broadcast.to(roomId).emit(UNLOCK_RECORD, { recordId, tableType });
    });
    socket.on(CREATE_RECORD, ({ records, tableType, roomId }) => {
        socket.broadcast.to(roomId).emit(CREATE_RECORD, { records, tableType });
    });
});
app.get("/api/getUserByID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const result = yield pool.query(`SELECT * FROM admin.user where id=$1;`, [id]);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/api/checkSameIDExists", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    try {
        const result = yield pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/api/getAllRoleEmployees", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const role = req.query.role;
    const tag = req.query.tag;
    if (!role || !tag) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const q = `select * from admin.user where role='${role}'`;
        const result = yield pool.query(q);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/api/getAllTreatments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = req.query.tag;
    if (!tag) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const q = `select * from ${tag}.TREATMENTS`;
        const result = yield pool.query(q);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/api/getAllVacantRooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = req.query.tag;
    if (!tag) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const q = `select * from ${tag}.TREATMENT_ROOM_INFO where tr_room_chartnum IS NULL`;
        const result = yield pool.query(q);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/api/getRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const where = req.body.where;
    const tag = req.body.tag;
    if (!where || !tag) {
        res.status(400).json({ message: "Invalid params" });
    }
    try {
        const values = req.body.values || [];
        let query = `select * from ${tag}.chart_schedule where delete_yn=false or delete_yn IS NULL`;
        where.forEach((w) => {
            query += " ";
            query += w;
        });
        const result = yield pool.query(query, values);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/api/insertRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const records = req.body.records;
    const tag = req.body.tag;
    try {
        const valuesTemplate = records
            .map((_, i) => `(${Array.from({ length: KEY_OF_SERVER_PRECORD.length - 2 }, (_, j) => `$${i * KEY_OF_SERVER_PRECORD.length + j + 1}`).join(", ")})`)
            .join(", ");
        console.log(KEY_OF_SERVER_PRECORD.slice(2).join(", "));
        const query = `
        INSERT INTO ${tag}.chart_schedule (
        ${KEY_OF_SERVER_PRECORD.slice(2).join(", ")}
        ) VALUES ${valuesTemplate}
        RETURNING *;
      `;
        const queryValues = [];
        records.forEach((record) => {
            let value = deconstructRecord(record);
            queryValues.push(...value);
        });
        const result = yield pool.query(query, queryValues);
        res.status(200).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error inserting records." });
    }
}));
app.post("/api/insertTreatment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = req.body.tag;
    if (!tag) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        yield pool.connect();
        const maxIdResult = yield pool.query(`SELECT MAX(id) AS max_id FROM ${tag}.TREATMENTS`);
        let maxId = maxIdResult.rows[0].max_id || 0;
        maxId += 1;
        const insertQuery = `
      INSERT INTO ${tag}.TREATENTS (id) VALUES (${maxId}) RETURNING *;
    `;
        const insertResult = yield pool.query(insertQuery);
        res.status(200).json(insertResult);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, role, password, firstName, lastName, clinic } = req.body;
    try {
        const hashedPassword = yield bcrypt.hash(password, 10);
        const regisgerResult = yield pool.query(`INSERT INTO admin.user ( role, first_name, last_name, login_id, login_pw, clinic ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;`, [
            role,
            firstName,
            lastName,
            userId,
            hashedPassword,
            clinic,
        ]);
        if (regisgerResult.rowCount === 1) {
            res.status(200).json({ user: regisgerResult.rows[0] });
        }
        else {
            res.status(400).json({ message: "Database 에러" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, password } = req.body;
    try {
        const users = yield pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
        if (users.rowCount == 0) {
            res.status(401).json({ message: "해당 아이디가 존재하지않습니다.", errorType: 1 });
            return;
        }
        const user = users.rows[0];
        const isMatch = yield bcrypt.compare(password, user.login_pw);
        if (!isMatch) {
            res.status(401).json({ message: "비밀번호가 틀렸습니다.", errorType: 2 });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", errorType: 3 });
    }
}));
app.put("/api/updateRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const record = req.body.record;
    const tag = req.body.tag;
    if (!tag || !record) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const query = updateQuery(`${tag}.chart_schedule`, KEY_OF_SERVER_PRECORD, "id");
        const values = deconstructRecord(record);
        const result = yield pool.query(query, values);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating records." });
    }
    finally {
    }
}));
app.put("/api/setUserSession", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.body.sessionId;
    const id = req.body.id;
    try {
        if (!id) {
            res.status(400).json({ message: "Invalid user data." });
            return;
        }
        const query = setUserSessionQuery("admin.user");
        const result = yield pool.query(query, [sessionId, id]);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating records." });
    }
}));
app.put("/api/hideRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = req.body.ids;
    const tag = req.body.tag;
    try {
        const q = `update ${tag}.chart_schedule SET delete_yn=true where id IN (${ids.join(", ")})`;
        yield pool.query(q);
        res.status(200).json({ message: "Records deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting records." });
    }
}));
app.put("/api/lockOrUnlockRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recordIds = req.body.recordIds;
    const lockingUser = req.body.lockingUser;
    const tag = req.body.tag;
    if (!tag || !recordIds) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        if (recordIds.length > 0) {
            const q = lockOrUnlockRowsQuery(`${tag}.chart_schedule`, recordIds.length);
            const values = [lockingUser, ...recordIds];
            const result = yield pool.query(q, values);
            res.status(200).json(result);
        }
        else {
            res.status(200).json({ message: "No records exist" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error locking record" });
    }
}));
app.put("/api/updateTreatment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const treatment = req.body.treatment;
    const tag = req.body.tag;
    if (!tag || !treatment) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const q = updateQuery(`${tag}.TREATMENTS`, KEY_OF_SERVER_TREATMENT, "id");
        const result = yield pool.query(q, deconstructTreatement(treatment));
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.code).json({ message: "Internal server error" });
    }
}));
app.delete("/api/deleteTreatment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const tag = req.query.tag;
    if (!id || !tag) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const q = `DELETE FROM ${tag}.${TREATMENTS} WHERE id=${id}`;
        const result = yield pool.query(q);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.code).json({ message: "Internal server error" });
    }
}));
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
