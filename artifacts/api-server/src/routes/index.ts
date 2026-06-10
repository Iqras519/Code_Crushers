import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import analysesRouter from "./analyses";
import statsRouter from "./stats";
import recommendationsRouter from "./recommendations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(analysesRouter);
router.use(statsRouter);
router.use(recommendationsRouter);

export default router;
