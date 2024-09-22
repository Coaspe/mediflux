var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { deconstructRecord, lockOrUnlockRowsQuery, setUserSessionQuery, deconstructTreatement, updateQuery } from "../utils.js";
import { KEY_OF_SERVER_PRECORD, KEY_OF_SERVER_TREATMENT, INTERNAL_SERVER_ERROR } from "shared";
const router = Router();
router.get("/getUserByID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const result = yield pool.query(`SELECT * FROM admin.user where id=$1;`, [id]);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.get("/checkSameIDExists", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    try {
        const result = yield pool.query(`SELECT * FROM admin.user where login_id=$1;`, [userId]);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.get("/getAllRoleEmployees", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.get("/getAllTreatments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.get("/getAllVacantRooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.post("/getRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.post("/insertRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const records = req.body.records;
    const tag = req.body.tag;
    try {
        const valuesTemplate = records
            .map((_, i) => `(${Array.from({ length: KEY_OF_SERVER_PRECORD.length - 2 }, (_, j) => `$${i * KEY_OF_SERVER_PRECORD.length + j + 1}`).join(", ")})`)
            .join(", ");
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
        res.status(500).json({ message: "Error inserting records." });
    }
}));
router.post("/insertTreatment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR, errorType: 3 });
    }
}));
router.put("/updateRecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
router.put("/setUserSession", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.put("/hideRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.put("/lockOrUnlockRecords", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.put("/updateTreatment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
router.delete("/deleteTreatment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const tag = req.query.tag;
    if (!id || !tag) {
        res.status(400).json({ message: "Invalid params" });
        return;
    }
    try {
        const q = `DELETE FROM ${tag}.TREATMENTS WHERE id=${id}`;
        const result = yield pool.query(q);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}));
export default router;
