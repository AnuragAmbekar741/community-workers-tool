import PDFDocument from "pdfkit";
import type { SessionExportData } from "../modules/sessions/sessions.service.js";

export function createWorkersExportPdf(
  data: SessionExportData,
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(18).text("Community Worker Session Export", { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Supervisor: ${data.supervisorName} (${data.supervisorId})`);
  doc.text(`Organisation: ${data.organisation ?? "N/A"}`);
  doc.moveDown();

  if (data.workers.length === 0) {
    doc.text("No assigned workers.");
    doc.end();
    return doc;
  }

  for (const worker of data.workers) {
    doc.fontSize(14).text(`${worker.name} (${worker.systemId})`, {
      underline: true,
    });
    doc.moveDown(0.5);

    if (worker.sessions.length === 0) {
      doc.fontSize(11).text("No sessions logged.");
      doc.moveDown();
      continue;
    }

    for (const session of worker.sessions) {
      doc.fontSize(11).text(`Session ${session.sessionId}`);
      doc.fontSize(10).text(`Date: ${session.sessionDate}`);
      doc.text(`District: ${session.district} | Topic: ${session.topic}`);
      doc.text(`Duration: ${session.durationMin} min | Total reached: ${session.totalReached}`);
      if (session.keyIssues) {
        doc.text(`Key issues: ${session.keyIssues}`);
      }
      doc.moveDown(0.5);
    }

    doc.moveDown();
  }

  doc.end();
  return doc;
}
