import { Router } from "express";
import { userAuth } from "../middleware/authMiddleware";
import { MeetController } from "../controllers/meetController";

const router = Router();

const meetController = new MeetController();


router.get("/:id", meetController.getAMeet);

router.use(userAuth)
router.post("/create", meetController.createMeet);

export default router;