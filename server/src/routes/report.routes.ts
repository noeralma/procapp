import { Router } from "express";
import {
  createReport,
  getReports,
  getDashboardStats,
  updateReport,
  deleteReport,
  exportReportsCsv,
  requestChange,
  grantEdit,
  denyChange,
  editReport,
} from "../controllers/report.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", createReport);
router.get("/", getReports);
router.get("/dashboard", authorize(["ADMIN"]), getDashboardStats);
router.put("/:id", authorize(["ADMIN"]), updateReport);
router.delete("/:id", authorize(["ADMIN"]), deleteReport);
router.get("/export", authorize(["ADMIN"]), exportReportsCsv);
router.post("/:id/request-change", authorize(["USER", "ADMIN"]), requestChange);
router.post("/:id/grant-edit", authorize(["ADMIN"]), grantEdit);
router.post("/:id/deny-change", authorize(["ADMIN"]), denyChange);
router.put("/:id/edit", authorize(["USER", "ADMIN"]), editReport);

export default router;
