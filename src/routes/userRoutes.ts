import { Router } from "express";
import { UserController } from "../controllers/userController";
import { userAuth } from "../middleware/authMiddleware";

const router = Router();
const userController = new UserController();

router.use(userAuth)
router.get("/profile", userController.userProfile);

export default router;