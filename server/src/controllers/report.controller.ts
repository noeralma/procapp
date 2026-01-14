import { Request, Response } from "express";
import prisma from "../utils/prisma";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, amount } = req.body;
    const userId = req.user!.id;

    const report = await prisma.report.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        userId,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error creating report" });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    const { month } = req.query as { month?: string };
    let dateFilter: { gte?: Date; lt?: Date } = {};
    if (month) {
      const [y, m] = month.split("-");
      const start = new Date(Number(y), Number(m) - 1, 1);
      const end = new Date(Number(y), Number(m), 1);
      dateFilter = { gte: start, lt: end };
    }
    let reports;

    if (role === "ADMIN") {
      reports = await (prisma as any).report.findMany({
        where: { createdAt: dateFilter.gte ? dateFilter : undefined },
        include: {
          user: { select: { name: true, email: true } },
          approvals: {
            orderBy: { createdAt: "desc" },
            select: {
              action: true,
              comment: true,
              createdAt: true,
              actorId: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      reports = await prisma.report.findMany({
        where: {
          userId: id,
          createdAt: dateFilter.gte ? dateFilter : undefined,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query as { month?: string };
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (month) {
      const [y, m] = month.split("-");
      const start = new Date(Number(y), Number(m) - 1, 1);
      const end = new Date(Number(y), Number(m), 1);
      dateFilter = { gte: start, lt: end };
    }
    const baseWhere = dateFilter ? { createdAt: dateFilter } : {};
    const totalReports = await prisma.report.count({ where: baseWhere });
    const pendingReports = await prisma.report.count({
      where: { status: "PENDING", ...baseWhere },
    });
    const approvedReports = await prisma.report.count({
      where: { status: "APPROVED", ...baseWhere },
    });
    const rejectedReports = await prisma.report.count({
      where: { status: "REJECTED", ...baseWhere },
    });
    const totalAmount = await prisma.report.aggregate({
      _sum: { amount: true },
      where: baseWhere,
    });

    res.json({
      totalReports,
      pendingReports,
      approvedReports,
      rejectedReports,
      totalAmount: totalAmount._sum.amount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

export const updateReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body as {
      status: string;
      comment?: string;
    };

    const report = await prisma.report.update({
      where: {
        id: Number(Array.isArray(id) ? id[0] : id),
      },
      data: { status },
    });
    await (prisma as any).approval.create({
      data: {
        action: status,
        comment,
        reportId: report.id,
        actorId: req.user!.id,
      },
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error updating report" });
  }
};

export const requestChange = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body as { comment?: string };
    const report = await prisma.report.findUnique({
      where: { id: Number(id) },
      select: { id: true, userId: true },
    });
    if (!report || report.userId !== req.user!.id) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    await (prisma as any).approval.create({
      data: {
        action: "REQUEST_CHANGE",
        comment,
        reportId: report.id,
        actorId: req.user!.id,
      },
    });
    res.json({ message: "Change request submitted" });
  } catch {
    res.status(500).json({ message: "Error requesting change" });
  }
};

export const grantEdit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body as { comment?: string };
    const report = await prisma.report.update({
      where: { id: Number(id) },
      data: { editable: true },
    });
    await (prisma as any).approval.create({
      data: {
        action: "CHANGE_GRANTED",
        comment,
        reportId: report.id,
        actorId: req.user!.id,
      },
    });
    res.json(report);
  } catch {
    res.status(500).json({ message: "Error granting edit" });
  }
};

export const denyChange = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body as { comment?: string };
    const report = await prisma.report.findUnique({ where: { id: Number(id) } });
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    await (prisma as any).approval.create({
      data: {
        action: "CHANGE_DENIED",
        comment,
        reportId: report.id,
        actorId: req.user!.id,
      },
    });
    res.json({ message: "Change request denied" });
  } catch {
    res.status(500).json({ message: "Error denying change" });
  }
};

export const editReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, amount, comment } = req.body as {
      title?: string;
      description?: string;
      amount?: number;
      comment?: string;
    };
    const report = await prisma.report.findUnique({
      where: { id: Number(id) },
      select: { id: true, userId: true, editable: true },
    });
    if (!report || report.userId !== req.user!.id) {
      res.status(404).json({ message: "Report not found" });
      return;
    }
    if (!report.editable) {
      res.status(403).json({ message: "Editing not allowed for this report" });
      return;
    }
    const updated = await prisma.report.update({
      where: { id: report.id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        amount: amount !== undefined ? Number(amount) : undefined,
        editable: false,
        status: "PENDING",
      },
    });
    await (prisma as any).approval.create({
      data: {
        action: "USER_EDITED",
        comment,
        reportId: updated.id,
        actorId: req.user!.id,
      },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error editing report" });
  }
};
export const deleteReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.report.delete({
      where: {
        id: Number(Array.isArray(id) ? id[0] : id),
      },
    });
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report" });
  }
};

export const exportReportsCsv = async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query as { month?: string };
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (month) {
      const [y, m] = month.split("-");
      const start = new Date(Number(y), Number(m) - 1, 1);
      const end = new Date(Number(y), Number(m), 1);
      dateFilter = { gte: start, lt: end };
    }
    const reports = await prisma.report.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const header = [
      "id",
      "title",
      "description",
      "amount",
      "status",
      "createdAt",
      "userEmail",
      "userName",
    ].join(",");
    const rows = reports.map((r) =>
      [
        r.id,
        `"${(r.title || "").replace(/"/g, '""')}"`,
        `"${(r.description || "").replace(/"/g, '""')}"`,
        r.amount,
        r.status,
        r.createdAt.toISOString(),
        r.user?.email || "",
        `"${(r.user?.name || "").replace(/"/g, '""')}"`,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reports.csv");
    res.send(csv);
  } catch {
    res.status(500).json({ message: "Error exporting reports" });
  }
};
