/** @format */

import pkg from "pg";

export const getUserByLoginID = async (pool: pkg.Pool, loginId: string) => {
  return await pool.query("select * from admin.user where login_id=$1;", [loginId]);
};

export const getSchema = async (pool:pkg.Pool) => {
  return await pool.query("select * FROM information_schema.tables where table_schema ilike '%SS%' or table_schema ilike '%share%' or table_schema like '%admin%' order by table_schema")
}

export const getChart = async (pool: pkg.Pool) => {
  return await pool.query("select * from gn_ss_bailor.chart_schedule")
}

export const deleteAllChart = async (pool: pkg.Pool) => {
  return await pool.query("delete from gn_ss_bailor.chart_schedule")
}