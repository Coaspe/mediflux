import { Router } from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { deconstructRecord, lockOrUnlockRowsQuery, setUserSessionQuery, deconstructTreatement, updateQuery } from "../utils.js";
import { KEY_OF_SERVER_PRECORD, KEY_OF_SERVER_TREATMENT, INTERNAL_SERVER_ERROR, PRecord } from "shared";

const router = Router();

router.get("/getUserByID", async (req, res) => {
  const id = req.query.id;

  try {
    const result = await pool.query(`SELECT * FROM admin.user where id=$1;`, [id]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.get("/checkSameIDExists", async (req, res) => {
  const userId = req.query.userId;

  try {
    const result = await pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.get("/getAllRoleEmployees", async (req, res) => {
  const role = req.query.role;
  const tag = req.query.tag;
  if (!role || !tag) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }

  try {
    const q = `select * from admin.user where role='${role}'`;
    const result = await pool.query(q);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.get("/getAllTreatments", async (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }

  try {
    const q = `select * from ${tag}.TREATMENTS`;
    const result = await pool.query(q);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.get("/getAllVacantRooms", async (req, res) => {
  const tag = req.query.tag;
  if (!tag) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }
  try {
    const q = `select * from ${tag}.TREATMENT_ROOM_INFO where tr_room_chartnum IS NULL`;
    const result = await pool.query(q);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/getRecords", async (req, res) => {
  const where = req.body.where;
  const tag = req.body.tag;

  if (!where || !tag) {
    res.status(400).json({ message: "Invalid params" });
  }
  try {
    const values = req.body.values || [];
    let query = `select * from ${tag}.chart_schedule where delete_yn=false or delete_yn IS NULL`;

    where.forEach((w: string) => {
      query += " ";
      query += w;
    });

    const result = await pool.query(query, values);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/insertRecords", async (req, res) => {
  const records = req.body.records;
  const tag = req.body.tag;

  try {
    const valuesTemplate = records
      .map((_: unknown, i: number) => `(${Array.from({ length: KEY_OF_SERVER_PRECORD.length - 2 }, (_, j) => `$${i * KEY_OF_SERVER_PRECORD.length + j + 1}`).join(", ")})`)
      .join(", ");
    const query = `
        INSERT INTO ${tag}.chart_schedule (
        ${KEY_OF_SERVER_PRECORD.slice(2).join(", ")}
        ) VALUES ${valuesTemplate}
        RETURNING *;
      `;

    const queryValues: unknown[] = [];
    records.forEach((record: PRecord) => {
      let value = deconstructRecord(record);
      queryValues.push(...value);
    });

    const result = await pool.query(query, queryValues);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error inserting records." });
  }
});

router.post("/insertTreatment", async (req, res) => {
  const tag = req.body.tag;

  if (!tag) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }

  try {
    await pool.connect();

    const maxIdResult = await pool.query(`SELECT MAX(id) AS max_id FROM ${tag}.TREATMENTS`);
    let maxId = maxIdResult.rows[0].max_id || 0;
    maxId += 1;
    const insertQuery = `
      INSERT INTO ${tag}.TREATENTS (id) VALUES (${maxId}) RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery);
    res.status(200).json(insertResult);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.post("/register", async (req, res) => {
  const { userId, role, password, firstName, lastName, clinic } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const regisgerResult = await pool.query(`INSERT INTO admin.user ( role, first_name, last_name, login_id, login_pw, clinic ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;`, [
      role,
      firstName,
      lastName,
      userId,
      hashedPassword,
      clinic,
    ]);
    if (regisgerResult.rowCount === 1) {
      res.status(200).json({ user: regisgerResult.rows[0] });
    } else {
      res.status(400).json({ message: "Database 에러" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const users = await pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);

    if (users.rowCount == 0) {
      res.status(401).json({ message: "해당 아이디가 존재하지않습니다.", errorType: 1 });
      return;
    }

    const user = users.rows[0];

    const isMatch = await bcrypt.compare(password, user.login_pw);

    if (!isMatch) {
      res.status(401).json({ message: "비밀번호가 틀렸습니다.", errorType: 2 });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR, errorType: 3 });
  }
});

router.put("/updateRecord", async (req, res) => {
  const record = req.body.record;
  const tag = req.body.tag;

  if (!tag || !record) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }

  try {
    const query = updateQuery(`${tag}.chart_schedule`, KEY_OF_SERVER_PRECORD, "id");

    const values = deconstructRecord(record);
    const result = await pool.query(query, values);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating records." });
  }
});

router.put("/setUserSession", async (req, res) => {
  const sessionId = req.body.sessionId;
  const id = req.body.id;
  try {
    if (!id) {
      res.status(400).json({ message: "Invalid user data." });
      return;
    }
    const query = setUserSessionQuery("admin.user");
    const result = await pool.query(query, [sessionId, id]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating records." });
  }
});

router.put("/hideRecords", async (req, res) => {
  const ids = req.body.ids;
  const tag = req.body.tag;
  try {
    const q = `update ${tag}.chart_schedule SET delete_yn=true where id IN (${ids.join(", ")})`;
    await pool.query(q);
    res.status(200).json({ message: "Records deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting records." });
  }
});

router.put("/lockOrUnlockRecords", async (req, res) => {
  const recordIds: string[] = req.body.recordIds;
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
      const result = await pool.query(q, values);
      res.status(200).json(result);
    } else {
      res.status(200).json({ message: "No records exist" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error locking record" });
  }
});

router.put("/updateTreatment", async (req, res) => {
  const treatment = req.body.treatment;
  const tag = req.body.tag;

  if (!tag || !treatment) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }

  try {
    const q = updateQuery(`${tag}.TREATMENTS`, KEY_OF_SERVER_TREATMENT, "id");

    const result = await pool.query(q, deconstructTreatement(treatment));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

router.delete("/deleteTreatment", async (req, res) => {
  const id = req.query.id;
  const tag = req.query.tag;

  if (!id || !tag) {
    res.status(400).json({ message: "Invalid params" });
    return;
  }

  try {
    const q = `DELETE FROM ${tag}.TREATMENTS WHERE id=${id}`;
    const result = await pool.query(q);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
});

export default router;
