import express from "express";
import LoanRecordController from "../controllers/LoanRecordController";
import { Schemas, ValidateSchema } from "../middlewares/Validation";

const router = express.Router();

router.get('/', LoanRecordController.getAllRecord);
router.post('/', ValidateSchema(Schemas.loan.create, 'body'), LoanRecordController.createRecord);
router.put('/', ValidateSchema(Schemas.loan.update, 'body'), LoanRecordController.updateRecord);
router.post('/query', ValidateSchema(Schemas.loan.query, 'body'), LoanRecordController.getRecordByProperty);

export = router;