import { Router, type IRouter } from "express";
import healthRouter from "./health";
import medicineRouter from "./medicine";

const router: IRouter = Router();

router.use(healthRouter);
router.use(medicineRouter);

export default router;
