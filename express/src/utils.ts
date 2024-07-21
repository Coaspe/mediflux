import pkg from "pg";
import bcrypt from "bcryptjs";

const insertUserTest = async (pool: pkg.Pool) => {
  let firstName = "구글";
  let lastName = "미트";
  let userId = "googleMeet";
  let hashedPassword = await bcrypt.hash("asefsf", 10);
  const result = await pool.query(`INSERT INTO admin.user (first_name, last_name, login_id, login_pw ) VALUES($1, $2, $3, $4)`, [firstName, lastName, userId, hashedPassword]);
};

const selectAllUsersTest = async (pool: pkg.Pool) => {
  const result = await pool.query("select * from admin.user;");
};
