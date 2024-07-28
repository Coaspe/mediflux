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
export const getUserByLoginID = (pool, loginId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("select * from admin.user where login_id=$1;", [loginId]);
});
export const getSchema = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("select * FROM information_schema.tables where table_schema ilike '%SS%' or table_schema ilike '%share%' or table_schema like '%admin%' order by table_schema");
});
export const getChart = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("select * from gn_ss_bailor.chart_schedule");
});
export const deleteAllChart = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    return yield pool.query("delete from gn_ss_bailor.chart_schedule");
});
