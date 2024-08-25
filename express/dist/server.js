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
import { CONNECTED_USERS, CONNECTION, CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, LOCK_RECORD, SAVE_RECORD, USER_JOINED, UNLOCK_RECORD, SCHEDULING_ROOM_ID, PORT, ARCHIVE_ROOM_ID } from "shared";
import { deconstructRecord, lockOrUnlockRowsQuery, updateRecordsQuery, setUserSessionQuery } from "./utils.js";
import { KEY_OF_SERVER_PRECORD } from "./contants.js";
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
app.post("/api/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, role, password, firstName, lastName } = req.body;
    try {
        const hashedPassword = yield bcrypt.hash(password, 10);
        const regisgerResult = yield pool.query(`INSERT INTO admin.user ( user_role, first_name, last_name, login_id, login_pw ) VALUES($1, $2, $3, $4, $5) RETURNING *;`, [
            role,
            firstName,
            lastName,
            userId,
            hashedPassword,
        ]);
        if (regisgerResult.rowCount === 1) {
            return res.status(200).json({ user: regisgerResult.rows[0] });
        }
        else {
            return res.status(400).json({ message: "Database 에러" });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, password } = req.body;
    try {
        const users = yield pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
        if (users.rowCount == 0) {
            return res.status(401).json({ message: "해당 아이디가 존재하지않습니다.", errorType: 1 });
        }
        const user = users.rows[0];
        const isMatch = yield bcrypt.compare(password, user.login_pw);
        if (!isMatch) {
            return res.status(401).json({ message: "비밀번호가 틀렸습니다.", errorType: 2 });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        return res.status(500).json({ message: "서버 에러", errorType: 3 });
    }
    finally {
    }
}));
app.get("/api/getUserByID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const users = yield pool.query(`SELECT * FROM admin.user where contact_id=$1;`, [id]);
        if (users.rowCount == 0) {
            return res.status(401).json({ message: "해당 유저가 존재하지않습니다." });
        }
        const user = users.rows[0];
        return res.status(200).json({ user });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/api/isLocked", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.recordId;
    try {
        const lockingUser = yield pool.query(`SELECT locking_user FROM gn_ss_bailor.chart_schedule where record_id=$1;`, [id]);
        if (lockingUser.rowCount == 0) {
            return res.status(401).json({ message: "해당 레코드가 존재하지 않습니다." });
        }
        const user = lockingUser.rows[0];
        return res.status(200).json({ user });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.get("/api/checkSameIDExists", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    try {
        const users = yield pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
        if (users.rowCount !== 0) {
            return res.status(401).json({ message: "동일한 아이디가 존재합니다." });
        }
        return res.status(200).json({});
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/api/insertRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const records = req.body.records;
    try {
        const valuesTemplate = records
            .map((_, i) => `(${Array.from({ length: KEY_OF_SERVER_PRECORD.length - 2 }, (_, j) => `$${i * KEY_OF_SERVER_PRECORD.length + j + 1}`).join(", ")})`)
            .join(", ");
        const query = `
        INSERT INTO gn_ss_bailor.chart_schedule (
        ${KEY_OF_SERVER_PRECORD.slice(2).join(", ")}
        ) VALUES ${valuesTemplate}
        RETURNING *;
      `;
        const queryValues = [];
        records.forEach((element) => {
            let value = deconstructRecord(element);
            queryValues.push(...value);
        });
        const result = yield pool.query(query, queryValues);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error inserting records:", error);
        res.status(500).send("Error inserting records.");
    }
    finally {
    }
}));
app.put("/api/updateRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const record = req.body.record;
    try {
        const query = updateRecordsQuery("gn_ss_bailor.chart_schedule");
        const values = deconstructRecord(record);
        const result = yield pool.query(query, values);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating records:", error);
        res.status(500).send("Error updating records.");
    }
    finally {
    }
}));
app.put("/api/setUserSession", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.body.sessionId;
    const id = req.body.id;
    try {
        if (!id)
            return res.status(400).send("Invalid user data.");
        const query = setUserSessionQuery("admin.user");
        const result = yield pool.query(query, [sessionId, id]);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).send("Error updating records.");
    }
    finally {
    }
}));
app.post("/api/getRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const where = req.body.where;
    try {
        const values = req.body.values ? req.body.values : [];
        let query = "select * from gn_ss_bailor.chart_schedule where delete_yn=false or delete_yn IS NULL";
        where.forEach((w) => {
            query += " ";
            query += w;
        });
        const result = yield pool.query(query, values);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.put("/api/hideRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = req.body.ids;
    try {
        const q = `update gn_ss_bailor.chart_schedule SET delete_yn=true where record_id IN (${ids.join(", ")})`;
        yield pool.query(q);
        res.status(200).send("Records deleted successfully.");
    }
    catch (error) {
        res.status(500).send("Error deleting records.");
    }
    finally {
    }
}));
app.put("/api/lockRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recordId = req.body.recordId;
    const lockingUser = req.body.lockingUser;
    try {
        const q = `update gn_ss_bailor.chart_schedule SET locking_user=$1 where record_id=$2`;
        const values = [lockingUser, recordId];
        yield pool.query(q, values);
        res.status(200).send("Records locking successfully.");
    }
    catch (error) {
        res.status(500).send("Error locking record");
    }
}));
app.put("/api/unlockRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recordId = req.body.recordId;
    try {
        const q = `update gn_ss_bailor.chart_schedule SET locking_user=NULL where record_id=$1`;
        const values = [recordId];
        yield pool.query(q, values);
        res.status(200).send("Records unlocking successfully.");
    }
    catch (error) {
        res.status(500).send("Error unlocking record");
    }
}));
app.put("/api/lockOrUnlockRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recordIds = req.body.recordIds;
    const lockingUser = req.body.lockingUser;
    try {
        const q = lockOrUnlockRowsQuery("gn_ss_bailor.chart_schedule", recordIds.length);
        const values = [lockingUser, ...recordIds];
        const result = yield pool.query(q, values);
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).send("Error locking record");
    }
}));
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
