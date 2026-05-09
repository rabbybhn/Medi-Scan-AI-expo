import { Router, type IRouter } from "express";
import healthRouter from "./health";
import medicineRouter from "./medicine";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(medicineRouter);
router.use(storageRouter);

export default router;
