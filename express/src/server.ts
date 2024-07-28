/** @format */

import express, { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import { CONNECTED_USERS, CONNECTION, CREATE_RECORD, DELETE_RECORD, JOIN_ROOM, LOCK_RECORD, SAVE_RECORD, USER_JOINED, UNLOCK_RECORD, SCHEDULING_ROOM_ID, PORT, ARCHIVE_ROOM_ID } from "shared";
import { getUserByLoginID } from "./utils.js";

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

  socket.on(
    SAVE_RECORD,
    ({ record, recordId, tableType, roomId, propertyName, newValue }: { record: string; recordId: string; tableType: string; roomId: string; propertyName: string; newValue: any }) => {
      socket.broadcast.to(roomId).emit(SAVE_RECORD, { record, recordId, tableType, propertyName, newValue });
    }
  );

  socket.on(UNLOCK_RECORD, ({ recordId, tableType, roomId }: { recordId: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(UNLOCK_RECORD, { recordId, tableType });
  });

  socket.on(CREATE_RECORD, ({ record, tableType, roomId }: { record: string; tableType: string; roomId: string }) => {
    socket.broadcast.to(roomId).emit(CREATE_RECORD, { record, tableType });
  });
});

app.post("/api/register", async (req, res) => {
  const { userId, role, password, firstName, lastName } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(`INSERT INTO admin.user ( user_role, first_name, last_name, login_id, login_pw ) VALUES($1, $2, $3, $4, $5)`, [
      role,
      firstName,
      lastName,
      userId,
      hashedPassword,
    ]);
    if (insertResult.rowCount !== 0) {
      const users = await getUserByLoginID(pool, userId);
      if (users.rowCount === 1) {
        return res.status(200).json({ user: users.rows[0] });
      } else {
        return res.status(400).json({ message: "Database 에러" });
      }
    }
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

app.post("/api/login", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const users = await pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
    console.log(users);
    
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
    return res.status(500).json({ message: "서버 에러", errorType: 3 });
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

app.get("/api/checkSameIDExists", async (req, res) => {
  const userId = req.query.userId;

  try {
    const users = await pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
    if (users.rowCount !== 0) {
      return res.status(401).json({ message: "동일한 아이디가 존재합니다." });
    }
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/insertRecord", async (req, res) => {
    const {
    checkInTime,
    chartNum,
    patientName,
    opReadiness,
    treatment1,
    treatment2,
    treatment3,
    treatment4,
    treatment5,
    quantityTreat1,
    quantityTreat2,
    quantityTreat3,
    quantityTreat4,
    quantityTreat5,
    treatmentRoom,
    doctor,
    anesthesiaNote,
    skincareSpecialist1,
    skincareSpecialist2,
    nursingStaff1,
    nursingStaff2,
    coordinator,
    consultant,
    commentCaution,
    lockingUser,
    deleteYN
  } = req.body;

  const query = `
    INSERT INTO GN_SS_BAILOR.CHART_SCHEDULE (
      chart_num, patient_name, op_readiness,
      treatment_1, treatment_2, treatment_3, treatment_4, treatment_5,
      quantity_treat_1, quantity_treat_2, quantity_treat_3, quantity_treat_4, quantity_treat_5,
      treatment_room, doctor, anesthesia_note,
      skincare_specialist_1, skincare_specialist_2,
      nursing_staff_1, nursing_staff_2, coordinator, consultant, comment_caution, locking_user, delete_yn
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
    )
    RETURNING *;
  `;

  const values = [
    chartNum, patientName, opReadiness,
    treatment1, treatment2, treatment3, treatment4, treatment5,
    quantityTreat1, quantityTreat2, quantityTreat3, quantityTreat4, quantityTreat5,
    treatmentRoom, doctor, anesthesiaNote,
    skincareSpecialist1, skincareSpecialist2,
    nursingStaff1, nursingStaff2, coordinator, consultant, commentCaution, lockingUser,deleteYN
  ];

  try {
    const result = await pool.query(query, values);
    console.log(result);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }

})
app.put('/updateRecords', async (req, res) => {
  const records = req.body.records;

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // 트랜잭션 시작

    for (const record of records) {
      const {
        id,
        checkInTime,
        chartNum,
        patientName,
        opReadiness,
        treatment1,
        treatment2,
        treatment3,
        treatment4,
        treatment5,
        quantityTreat1,
        quantityTreat2,
        quantityTreat3,
        quantityTreat4,
        quantityTreat5,
        treatmentRoom,
        doctor,
        anesthesiaNote,
        skincareSpecialist1,
        skincareSpecialist2,
        nursingStaff1,
        nursingStaff2,
        coordinator,
        consultant,
        commentCaution,
        lockingUser,
        readyTime,
        deleteYN,
        treatmentReady1,
        treatmentReady2,
        treatmentReady3,
        treatmentReady4,
        treatmentReady5,
        treatmentEnd1,
        treatmentEnd2,
        treatmentEnd3,
        treatmentEnd4,
        treatmentEnd5
      } = record;

      const query = `
        UPDATE your_table_name
        SET check_in_time = $1,
            chart_num = $2,
            patient_name = $3,
            op_readiness = $4,
            treatment_1 = $5,
            treatment_2 = $6,
            treatment_3 = $7,
            treatment_4 = $8,
            treatment_5 = $9,
            quantity_treat_1 = $10,
            quantity_treat_2 = $11,
            quantity_treat_3 = $12,
            quantity_treat_4 = $13,
            quantity_treat_5 = $14,
            treatment_room = $15,
            doctor = $16,
            anesthesia_note = $17,
            skincare_specialist_1 = $18,
            skincare_specialist_2 = $19,
            nursing_staff_1 = $20,
            nursing_staff_2 = $21,
            coordinator = $22,
            consultant = $23,
            comment_caution = $24,
            locking_user = $25,
            ready_time = $26,
            delete_yn = $27,
            treatment_ready_1 = $28,
            treatment_ready_2 = $29,
            treatment_ready_3 = $30,
            treatment_ready_4 = $31,
            treatment_ready_5 = $32,
            treatment_end_1 = $33,
            treatment_end_2 = $34,
            treatment_end_3 = $35,
            treatment_end_4 = $36,
            treatment_end_5 = $37
        WHERE id = $38
      `;
      const values = [
        checkInTime,
        chartNum,
        patientName,
        opReadiness,
        treatment1,
        treatment2,
        treatment3,
        treatment4,
        treatment5,
        quantityTreat1,
        quantityTreat2,
        quantityTreat3,
        quantityTreat4,
        quantityTreat5,
        treatmentRoom,
        doctor,
        anesthesiaNote,
        skincareSpecialist1,
        skincareSpecialist2,
        nursingStaff1,
        nursingStaff2,
        coordinator,
        consultant,
        commentCaution,
        lockingUser,
        readyTime,
        deleteYN,
        treatmentReady1,
        treatmentReady2,
        treatmentReady3,
        treatmentReady4,
        treatmentReady5,
        treatmentEnd1,
        treatmentEnd2,
        treatmentEnd3,
        treatmentEnd4,
        treatmentEnd5,
        id,
      ];
      await client.query(query, values);
    }

    await client.query('COMMIT'); // 트랜잭션 커밋
    res.status(200).send('Records updated successfully.');
  } catch (error) {
    await client.query('ROLLBACK'); // 트랜잭션 롤백
    console.error('Error updating records:', error);
    res.status(500).send('Error updating records.');
  } finally {
    client.release();
  }
});
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
