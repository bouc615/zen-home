import express from "express";
import cors from "cors";
import { PORT, ALLOWED_ORIGINS } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import itemsRouter from "./routes/items";
import recipesRouter from "./routes/recipes";
import aiRouter from "./routes/ai";
import uploadRouter from "./routes/upload";

const app = express();

// Middleware
app.use(
  cors({
    origin: ALLOWED_ORIGINS.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (for chat test page)
app.use(express.static("public"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/items", itemsRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/ai", aiRouter);
app.use("/api/upload", uploadRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
