import { Router } from "express";
import { userAuth } from "../middleware/authMiddleware";
import { EnvironmentController } from "../controllers/environmentController";

const router = Router();

const environmentController = new EnvironmentController();

router.get("/", environmentController.getEnvironment);

router.use(userAuth);
router.post("/create", environmentController.createEnvironment);
router.put("/:id", environmentController.setEnvironment);

export default router;
