import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Lock } from "lucide-react";
import { useNavigate } from "react-router";

interface ReportData {
  businessName: string;
  totalScans: number;
  totalRedirects: number;
  totalFeedbacks: number;
  conversionRate: number;
  feedbacks: Array<{
    customerName: string;
    rating: number;
    message: string;
    createdAt: number;
    status: string;
  }>;
  starDistribution: Record<number, number>;
}

interface MonthlyReportProps {
  data: ReportData;
  isPro: boolean;
  filterLabel: string;
}

export function MonthlyReport({ data, isPro, filterLabel }: MonthlyReportProps) {
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const generateReport = () => {
    setGenerating(true);

    const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

    const feedbackRows = data.feedbacks
      .map(
        (fb) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:13px;">${fb.customerName}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#92400e;font-size:13px;">${stars(fb.rating)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px;">${new Date(fb.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:12px;line-height:1.5;">${fb.message}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;${fb.status === "resolved" ? "background:#dcfce7;color:#166534;" : "background:#fef2f2;color:#991b1b;"}">
              ${fb.status === "resolved" ? "Resolved" : "Unresolved"}
            </span>
          </td>
        </tr>`
      )
      .join("");

    const starBars = Object.entries(data.starDistribution)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([star, count]) => {
        const maxCount = Math.max(...Object.values(data.starDistribution), 1);
        const pct = (count / maxCount) * 100;
        const color = Number(star) >= 4 ? "#16A34A" : Number(star) >= 3 ? "#F59E0B" : "#EF4444";
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="width:16px;text-align:right;font-size:12px;color:#6b7280;">${star}★</span>
            <div style="flex:1;height:20px;background:#f3f4f6;border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width 0.5s;"></div>
            </div>
            <span style="width:32px;font-size:12px;color:#374151;font-weight:600;">${count}</span>
          </div>`;
      })
      .join("");

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>STAR CATCH Monthly Report — ${data.businessName}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 20mm; size: A4; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;">
        <div style="max-width:800px;margin:0 auto;padding:40px 32px;background:#fff;">

          <!-- Header -->
          <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #16A34A;">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="width:32px;height:32px;background:#16A34A;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:white;font-size:18px;">★</span>
              </div>
              <span style="font-size:18px;font-weight:800;color:#18181b;letter-spacing:0.5px;">STAR CATCH</span>
            </div>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#18181b;">Monthly Performance Report</h1>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${data.businessName} — ${filterLabel}</p>
            <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>

          <!-- KPI Cards -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px;">
            <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#16A34A;">${data.totalScans}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Total Taps</p>
            </div>
            <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#16A34A;">${data.totalRedirects}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Google Reviews</p>
            </div>
            <div style="text-align:center;padding:16px;background:#fffbeb;border-radius:12px;border:1px solid #fde68a;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#d97706;">${data.totalFeedbacks}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Private Feedback</p>
            </div>
            <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#16A34A;">${data.conversionRate}%</p>
              <p style="margin:4px 0 0;font-size:11px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Conversion</p>
            </div>
          </div>

          <!-- Star Distribution -->
          <div style="margin-bottom:32px;">
            <h2 style="font-size:16px;font-weight:700;color:#18181b;margin:0 0 16px;">⭐ Star Rating Distribution</h2>
            <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;border:1px solid #e5e7eb;">
              ${starBars}
            </div>
          </div>

          <!-- Conversion Summary -->
          <div style="margin-bottom:32px;padding:16px 20px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
            <h2 style="font-size:14px;font-weight:700;color:#1e40af;margin:0 0 8px;">💡 Conversion Summary</h2>
            <p style="margin:0;font-size:13px;color:#1e3a5f;line-height:1.6;">
              Out of <strong>${data.totalScans}</strong> total customer taps, <strong>${data.totalRedirects}</strong> (${data.conversionRate}%) were redirected to leave Google Reviews, while <strong>${data.totalFeedbacks}</strong> were captured as private feedback — preventing negative public reviews.
              ${data.totalFeedbacks > 0 ? `An estimated <strong>৳${(data.totalFeedbacks * 750).toLocaleString()}</strong> in customer lifetime value was preserved.` : ""}
            </p>
          </div>

          <!-- Detailed Feedback Table -->
          ${data.feedbacks.length > 0 ? `
          <div style="margin-bottom:32px;">
            <h2 style="font-size:16px;font-weight:700;color:#18181b;margin:0 0 16px;">📋 Private Feedback Details</h2>
            <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Customer</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Rating</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Date</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Message</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${feedbackRows}
                </tbody>
              </table>
            </div>
          </div>
          ` : ""}

          <!-- Footer -->
          <div style="text-align:center;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">STAR CATCH Reviews and Feedback Agency Bd</p>
            <p style="margin:4px 0 0;font-size:10px;color:#d1d5db;">This report was auto-generated by your STAR CATCH review gateway.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open in new window and trigger print (which allows Save as PDF)
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      // Small delay to ensure content renders before print dialog
      setTimeout(() => printWindow.print(), 500);
    }

    setGenerating(false);
  };

  return (
    <div className="relative">
      {!isPro ? (
        <div className="relative group">
          <Button variant="outline" size="sm" disabled
            className="border-white/10 bg-white/5 text-[#A1A1AA]/40 cursor-not-allowed text-xs opacity-60">
            <Lock className="w-3.5 h-3.5 mr-1.5" /> Export PDF Report
          </Button>
          <div className="absolute right-0 top-full mt-2 z-20 hidden group-hover:block w-56 p-3 rounded-xl bg-[#18181B] border border-white/10 shadow-xl">
            <p className="text-[10px] font-semibold text-[#16A34A] mb-1">PRO FEATURE</p>
            <p className="text-xs text-[#A1A1AA] mb-2">Upgrade to Business Pro to export monthly performance reports</p>
            <Button onClick={() => navigate("/pricing")} size="sm"
              className="w-full h-7 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
              Upgrade Now
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={generateReport} disabled={generating}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs">
          {generating ? (
            <><div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" /> Generating...</>
          ) : (
            <><FileText className="w-3.5 h-3.5 mr-1.5" /> Export PDF Report</>
          )}
        </Button>
      )}
    </div>
  );
}
