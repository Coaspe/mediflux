/** @format */

import express, { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import {
  CONNECTED_USERS,
  CONNECTION,
  CREATE_RECORD,
  DELETE_RECORD,
  JOIN_ROOM,
  LOCK_RECORD,
  SAVE_RECORD,
  USER_JOINED,
  UNLOCK_RECORD,
  SCHEDULING_ROOM_ID,
  PORT,
  ARCHIVE_ROOM_ID,
  ServerUser,
} from "shared";

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

const app: Express = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const roomUsers: { [key: string]: { [key: string]: string } } = {};

roomUsers[SCHEDULING_ROOM_ID] = {};
roomUsers[ARCHIVE_ROOM_ID] = {};
// pool.query("select * from admin.user").then((result) => console.log(result.rows[0] as ServerUser));

io.on(CONNECTION, (socket) => {
  socket.on(JOIN_ROOM, ({ userId, username, roomId }: { userId: number; username: string; roomId: string }) => {
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

  socket.on(LOCK_RECORD, ({ recordId, locker, isLocked, tableType, roomId }: { recordId: string; locker: string; isLocked: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(LOCK_RECORD, { recordId, locker, isLocked, tableType });
  });

  socket.on(DELETE_RECORD, ({ recordId, tableType, roomId }: { recordId: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(DELETE_RECORD, { recordId, tableType });
  });

  socket.on(SAVE_RECORD, ({ recordId, record, tableType, roomId }: { recordId: string; record: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(SAVE_RECORD, { recordId, record, tableType });
  });

  socket.on(UNLOCK_RECORD, ({ recordId, tableType, roomId }: { recordId: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(UNLOCK_RECORD, { recordId, tableType });
  });

  socket.on(CREATE_RECORD, ({ record, tableType, roomId }: { record: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(CREATE_RECORD, { record, tableType });
  });
});

app.post("/api/register", async (req, res) => {
  const { userId, username, password, firstName, last_name } = req.body;
  const checkExists = await pool.query(`SELECT contact_id FROM admin.user where login_id = ${userId};`);

  try {
    if (checkExists.rowCount && checkExists.rowCount > 0) {
      return res.status(400).json({ error: "해당 아이디가 이미 존재합니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(`INSERT INTO admin.user (first_name, last_name, login_id, login_pw ) VALUES($1, $2, $3, $4)`, [firstName, last_name, userId, hashedPassword]);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

app.post("/api/login", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const users = await pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);

    if (users.rowCount == 0) {
      return res.status(401).json({ message: "해당 아이디가 존재하지않습니다.", errorType: 1 });
    }

    const user = users.rows[0];
    const isMatch = await bcrypt.compare(password, user.login_pw);

    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다.", errorType: 2 });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", errorType: 3 });
  } finally {
  }
});

app.get("/api/getUserByID", async (req, res) => {
  const id = req.query.id;

  try {
    const users = await pool.query(`SELECT * FROM admin.user where contact_id=$1;`, [id]);
    if (users.rowCount == 0) {
      return res.status(401).json({ message: "해당 유저가 존재하지않습니다." });
    }

    const user = users.rows[0];

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
