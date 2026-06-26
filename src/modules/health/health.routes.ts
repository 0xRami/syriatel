import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "syriatel-sms-integration",
    status: "ok"
  });
});

export default router;
