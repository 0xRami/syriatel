import { Router } from "express";
import { requireInternalApiKey } from "../../shared/middleware/authMiddleware";
import { listTemplatesHandler, sendTemplateSmsHandler } from "./sms.controller";

const router = Router();

router.use(requireInternalApiKey);

router.get("/templates", listTemplatesHandler);
router.post("/template", sendTemplateSmsHandler);
router.post("/template/:language(ar|arabic|en|english)", sendTemplateSmsHandler);

export default router;
