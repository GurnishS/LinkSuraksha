import { Router } from "express";
import { addClient, removeClient, sendNotification } from "../utils/sseService.js";
import { verifyJWT, verifySSEJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Secure SSE connection using ?token=<JWT>
router.get("/notifications", verifySSEJWT, (req, res) => {
  const userId = req.user._id.toString();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`: connected to notification stream for ${userId}\n\n`);

  addClient(userId, res);

  req.on("close", () => {
    removeClient(userId);
  });
});

// Authenticated notification trigger endpoint
router.post("/notify", verifyJWT, (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required" });
  }

  sendNotification(userId, message);
  res.json({ success: true });
});

export default router;
