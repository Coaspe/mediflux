var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcryptjs";
const insertUserTest = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    let firstName = "구글";
    let lastName = "미트";
    let userId = "googleMeet";
    let hashedPassword = yield bcrypt.hash("asefsf", 10);
    const result = yield pool.query(`INSERT INTO admin.user (first_name, last_name, login_id, login_pw ) VALUES($1, $2, $3, $4)`, [firstName, lastName, userId, hashedPassword]);
});
const selectAllUsersTest = (pool) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pool.query("select * from admin.user;");
});
