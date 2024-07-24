/** @format */

import pkg from "pg";

export const getUserByLoginID = async (pool: pkg.Pool, loginId: string) => {
  return await pool.query("select * from admin.user where login_id=$1;", [loginId]);
};
