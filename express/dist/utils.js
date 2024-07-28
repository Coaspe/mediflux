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
export const deconstructRecord = (record, exceptId) => {
    const { checkInTime, chartNum, patientName, opReadiness, treatment1, treatment2, treatment3, treatment4, treatment5, quantityTreat1, quantityTreat2, quantityTreat3, quantityTreat4, quantityTreat5, treatmentRoom, doctor, anesthesiaNote, skincareSpecialist1, skincareSpecialist2, nursingStaff1, nursingStaff2, coordinator, consultant, commentCaution, lockingUser, deleteYN, treatmentReady1, treatmentReady2, treatmentReady3, treatmentReady4, treatmentReady5, treatmentEnd1, treatmentEnd2, treatmentEnd3, treatmentEnd4, treatmentEnd5, } = record;
    const retVal = [
        new Date(checkInTime),
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
    ];
    const { id } = record;
    if (id) {
        retVal.unshift(id);
    }
    return retVal;
};
