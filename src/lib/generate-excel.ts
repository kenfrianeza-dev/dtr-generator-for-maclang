import ExcelJS from "exceljs";
import { format, getDaysInMonth } from "date-fns";

export interface DTRDayData {
  day: number;
  dayType?: "work" | "off" | "holiday";
  dayOff?: boolean; // legacy fallback
  morningArrival: string;
  morningDeparture: string;
  afternoonArrival: string;
  afternoonDeparture: string;
  overtimeHours: string;
  overtimeMinutes: string;
}

export interface DTRFormData {
  name: string;
  leftPeriod: { from: Date | undefined; to?: Date | undefined } | null;
  rightPeriod: { from: Date | undefined; to?: Date | undefined } | null;
  leftOfficialHours: string;
  rightOfficialHours: string;
  leftRegularDaysHours: string;
  rightRegularDaysHours: string;
  leftSaturdaysHours: string;
  rightSaturdaysHours: string;
  days: DTRDayData[];
}

// Convert 24h "HH:mm" from <input type="time"> to "h:mm AM/PM"
function formatTimeTo12h(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length !== 2) return time24;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes} ${period}`;
}




/**
 * Writes one copy of the DTR form into the worksheet starting at startCol.
 * Each DTR copy spans 7 columns:
 *   col+0: Day
 *   col+1: Morning Arrival
 *   col+2: Morning Departure
 *   col+3: Afternoon Arrival
 *   col+4: Afternoon Departure
 *   col+5: Overtime Hours
 *   col+6: Overtime Minutes
 */
function writeDTRCopy(
  ws: ExcelJS.Worksheet,
  startCol: number,
  data: DTRFormData,
  baseDate: Date,
  periodString: string,
  periodObj: { from?: Date; to?: Date } | null,
  officialHours: string,
  regularDaysHours: string,
  saturdaysHours: string
) {
  const daysInMonth = getDaysInMonth(baseDate);
  const c = (offset: number) => startCol + offset;
  const defaultFont: Partial<ExcelJS.Font> = { name: "Arial", size: 8 };


  // ── Row 1: "Civil Service Form No. 48" ──
  ws.mergeCells(1, c(0), 1, c(6));
  const formNoCell = ws.getCell(1, c(0));
  formNoCell.value = "Civil Service Form No. 48";
  formNoCell.font = { ...defaultFont, size: 8, italic: false };
  formNoCell.alignment = { horizontal: "left" };

  // ── Row 3: "DAILY TIME RECORD" ──
  ws.mergeCells(3, c(0), 3, c(6));
  const dtrTitle = ws.getCell(3, c(0));
  dtrTitle.value = "DAILY TIME RECORD";
  dtrTitle.font = { ...defaultFont, size: 12, bold: true };
  dtrTitle.alignment = { horizontal: "center", vertical: "middle", shrinkToFit: true };

  // ── Row 5: Employee Name (bold, underlined) ──
  ws.mergeCells(5, c(0), 5, c(6));
  const nameCell = ws.getCell(5, c(0));
  nameCell.value = data.name.toUpperCase();
  nameCell.font = { ...defaultFont, size: 12, bold: false };
  nameCell.alignment = { horizontal: "center" };
  nameCell.border = { bottom: { style: "thin" } };

  // ── Row 6: "NAME" label ──
  ws.mergeCells(6, c(0), 6, c(6));
  const nameLabel = ws.getCell(6, c(0));
  nameLabel.value = "NAME";
  nameLabel.font = { ...defaultFont, size: 9, bold: true };
  nameLabel.alignment = { horizontal: "center" };

  // ── Row 8: "For the Month of:" + period ──
  ws.mergeCells(8, c(0), 8, c(2));
  const monthLabel = ws.getCell(8, c(0));
  monthLabel.value = "For the Month of:";
  monthLabel.font = { ...defaultFont, size: 8 };

  ws.mergeCells(8, c(3), 8, c(6));
  const monthValue = ws.getCell(8, c(3));
  monthValue.value = periodString;
  monthValue.font = { ...defaultFont, size: 8, bold: false, underline: false };
  monthValue.border = { bottom: { style: "thin" } };

  // ── Row 9: "Official Hours:" ──
  ws.mergeCells(9, c(0), 9, c(2));
  const ohLabel = ws.getCell(9, c(0));
  ohLabel.value = "Official Hours:";
  ohLabel.font = { ...defaultFont, size: 8, italic: false };

  ws.mergeCells(9, c(3), 9, c(6));
  const ohValue = ws.getCell(9, c(3));
  const ohLength = officialHours ? officialHours.length : 0;
  ohValue.value = officialHours ? officialHours.toUpperCase() : "";
  ohValue.font = { ...defaultFont, size: ohLength >= 38 ? 6 : 8, bold: false };
  if (ohLength >= 38) {
    ohValue.alignment = { wrapText: true, vertical: "middle" };
  }
  ohValue.border = { bottom: { style: "thin" } };

  // ── Row 10: "For Arrival & Departure Regular D." ──
  ws.mergeCells(10, c(0), 10, c(3));
  const adLabel = ws.getCell(10, c(0));
  adLabel.value = "For Arrival & Departure Regular Days.";
  adLabel.font = { ...defaultFont, size: 8, italic: false };

  ws.mergeCells(10, c(4), 10, c(6));
  const adValue = ws.getCell(10, c(4));
  const adLength = regularDaysHours ? regularDaysHours.length : 0;
  adValue.value = regularDaysHours ? regularDaysHours.toUpperCase() : "";
  adValue.font = { ...defaultFont, size: adLength >= 38 ? 6 : 8, bold: false };
  if (adLength >= 38) {
    adValue.alignment = { wrapText: true, vertical: "middle" };
  }
  adValue.border = { bottom: { style: "thin" } };

  // ── Row 11: "Saturdays:" ──
  const satLabel = ws.getCell(11, c(3));
  satLabel.value = "Saturdays:";
  satLabel.font = { ...defaultFont, size: 8, italic: false };

  ws.mergeCells(11, c(4), 11, c(6));
  const satValue = ws.getCell(11, c(4));
  const satLength = saturdaysHours ? saturdaysHours.length : 0;
  satValue.value = saturdaysHours ? saturdaysHours.toUpperCase() : "";
  satValue.font = { ...defaultFont, size: satLength >= 38 ? 6 : 8 };
  if (satLength >= 38) {
    satValue.alignment = { wrapText: true, vertical: "middle" };
  }
  satValue.border = { bottom: { style: "thin" } };

  // ══════════════════════════════════════════════════
  //  TABLE HEADERS (Rows 13-14, row 12 is spacer)
  // ══════════════════════════════════════════════════

  // Row 12 spacer: medium borders to extend the table frame
  for (let ci = 0; ci <= 6; ci++) {
    ws.getCell(12, c(ci)).border = {
      top: { style: "medium" },
      left: ci === 0 ? { style: "medium" } : undefined,
      right: (ci === 0 || ci === 6) ? { style: "medium" } : undefined,
      bottom: ci === 0 ? { style: "thin", color: { argb: "FFFFFFFF" } } : { style: "thin" },
    };
  }

  // A13: empty cell — outer frame only (left medium, others invisible)
  ws.getCell(13, c(0)).border = {
    top: { style: "thin", color: { argb: "FFFFFFFF" } },
    left: { style: "medium" },
    right: { style: "medium" },
    bottom: undefined,
  };

  // "Days" header (row 14 only, col 0)
  const dayH = ws.getCell(14, c(0));
  dayH.value = "Days";
  dayH.font = { ...defaultFont, bold: false, size: 8 };
  dayH.alignment = { horizontal: "center", vertical: "middle" };
  dayH.border = {
    top: undefined,
    left: { style: "medium" },
    right: { style: "medium" },
    bottom: { style: "medium" },
  };

  // "Morning" header (merged cols 1-2, row 13)
  ws.mergeCells(13, c(1), 13, c(2));
  const mornH = ws.getCell(13, c(1));
  mornH.value = "Morning";
  mornH.font = { ...defaultFont, bold: true, size: 8 };
  mornH.alignment = { horizontal: "center" };
  mornH.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
    bottom: { style: "thin" },
  };

  // "Afternoon" header (merged cols 3-4, row 13)
  ws.mergeCells(13, c(3), 13, c(4));
  const aftH = ws.getCell(13, c(3));
  aftH.value = "Afternoon";
  aftH.font = { ...defaultFont, bold: true, size: 8 };
  aftH.alignment = { horizontal: "center" };
  aftH.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
    bottom: { style: "thin" },
  };

  // "Overtime" header (merged cols 5-6, row 13)
  ws.mergeCells(13, c(5), 13, c(6));
  const otH = ws.getCell(13, c(5));
  otH.value = "Overtime";
  otH.font = { ...defaultFont, bold: true, size: 8, italic: false };
  otH.alignment = { horizontal: "center" };
  otH.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    right: { style: "medium" },
    bottom: { style: "thin" },
  };

  // Sub-headers (row 14)
  const subLabels = [
    "Arrived",
    "Departure",
    "Arrived",
    "Departure",
    "Hours",
    "Minutes",
  ];
  subLabels.forEach((label, i) => {
    const cell = ws.getCell(14, c(i + 1));
    cell.value = label;
    cell.font = { ...defaultFont, bold: false, italic: false, size: 8 };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: i === 5 ? { style: "medium" } : { style: "thin" }, // rightmost col gets medium
      bottom: { style: "medium" },
    };
  });

  // ══════════════════════════════════════════════════
  //  DATA ROWS (Rows 15–45) → Days 1–31
  // ══════════════════════════════════════════════════

  // Helper: build border for a data cell based on its position
  const dataBorder = (colIdx: number, isLastRow: boolean): Partial<ExcelJS.Borders> => ({
    top: { style: "thin" },
    left: { style: colIdx === 0 ? "medium" : "thin" },
    right: { style: colIdx === 6 ? "medium" : "thin" },
    bottom: { style: isLastRow ? "medium" : "thin" },
  });

  for (let dayIdx = 0; dayIdx < 31; dayIdx++) {
    const row = 15 + dayIdx;
    const dayData = data.days[dayIdx];
    const isDayInMonth = dayIdx < daysInMonth;
    
    let isDayInPeriod = isDayInMonth;
    if (isDayInMonth && periodObj?.from) {
      const currentDayDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayIdx + 1);
      currentDayDate.setHours(0,0,0,0);
      const pFrom = new Date(periodObj.from);
      pFrom.setHours(0,0,0,0);
      
      let pTo = pFrom;
      if (periodObj.to) {
        pTo = new Date(periodObj.to);
        pTo.setHours(0,0,0,0);
      }
      
      if (currentDayDate.getTime() < pFrom.getTime() || currentDayDate.getTime() > pTo.getTime()) {
        isDayInPeriod = false;
      }
    }

    const isLastRow = dayIdx === 30; // day 31 = last row

    // Day number cell
    const dayCell = ws.getCell(row, c(0));
    dayCell.value = dayIdx + 1;
    dayCell.font = { ...defaultFont, bold: false, size: 8 };
    dayCell.alignment = { horizontal: "right", vertical: "middle" };
    dayCell.border = dataBorder(0, isLastRow);

    if (!isDayInPeriod) {
      // Day doesn't exist in this month — empty bordered cells
      for (let ci = 1; ci <= 6; ci++) {
        const cell = ws.getCell(row, c(ci));
        cell.border = dataBorder(ci, isLastRow);
      }
      continue;
    }

    const isOff = dayData.dayType === "off" || dayData.dayOff === true;
    const isHoliday = dayData.dayType === "holiday";
    
    if (isOff || isHoliday) {
      // Show "OFF" or "HOLIDAY" in all time & overtime cells
      const label = isHoliday ? "HOLIDAY" : "OFF";
      for (let ci = 1; ci <= 6; ci++) {
        const cell = ws.getCell(row, c(ci));
        cell.value = label;
        cell.font = { ...defaultFont, bold: false, size: 8 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = dataBorder(ci, isLastRow);
      }
    } else {
      // Normal day — formatted times
      const timeValues = [
        formatTimeTo12h(dayData.morningArrival),
        formatTimeTo12h(dayData.morningDeparture),
        formatTimeTo12h(dayData.afternoonArrival),
        formatTimeTo12h(dayData.afternoonDeparture),
      ];

      timeValues.forEach((tv, i) => {
        const cell = ws.getCell(row, c(i + 1));
        cell.value = tv;
        cell.font = { ...defaultFont, size: 9 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = dataBorder(i + 1, isLastRow);
      });

      // Overtime columns
      const otHoursCell = ws.getCell(row, c(5));
      otHoursCell.value = dayData.overtimeHours ? dayData.overtimeHours.toUpperCase() : "";
      otHoursCell.font = { ...defaultFont, size: 8 };
      otHoursCell.alignment = { horizontal: "center", vertical: "middle" };
      otHoursCell.border = dataBorder(5, isLastRow);

      const otMinCell = ws.getCell(row, c(6));
      otMinCell.value = dayData.overtimeMinutes ? dayData.overtimeMinutes.toUpperCase() : "";
      otMinCell.font = { ...defaultFont, size: 8 };
      otMinCell.alignment = { horizontal: "center", vertical: "middle" };
      otMinCell.border = dataBorder(6, isLastRow);
    }
  }

  // ══════════════════════════════════════════════════
  //  CERTIFICATION (Rows 46–48)
  // ══════════════════════════════════════════════════

  ws.mergeCells(46, c(0), 49, c(6));
  const certCell = ws.getCell(46, c(0));
  certCell.value =
    "          I certify to my honor that the above is a true and \ncorrect report of the hours of work performed, record of \nwhich was made daily at the time of arrival and departure \nfrom office.";
  certCell.font = { ...defaultFont, size: 10, italic: false };
  certCell.alignment = {
    horizontal: "justify",
    vertical: "top",
    wrapText: true,
    indent: 0,
  };

}

function formatPeriodString(period: { from?: Date; to?: Date } | null): string {
  if (!period?.from) return "";
  if (!period.to) return format(period.from, "MMMM dd, yyyy").toUpperCase();
  
  if (period.from.getMonth() === period.to.getMonth() && period.from.getFullYear() === period.to.getFullYear()) {
    return `${format(period.from, "MMMM dd")} - ${format(period.to, "dd, yyyy")}`.toUpperCase();
  }
  if (period.from.getFullYear() === period.to.getFullYear()) {
    return `${format(period.from, "MMM dd")} - ${format(period.to, "MMM dd, yyyy")}`.toUpperCase();
  }
  return `${format(period.from, "MMM dd, yyyy")} - ${format(period.to, "MMM dd, yyyy")}`.toUpperCase();
}

/**
 * Generate the full DTR Excel workbook and trigger a browser download.
 */
export async function generateDTRExcel(data: DTRFormData): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("DTR", {
    views: [
      { showGridLines: false, style: "pageBreakPreview" as const }
    ],
    properties: {
      defaultRowHeight: 15
    },
    pageSetup: {
      paperSize: 5, // Legal (8.5 x 14 inches)
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
  });

  const leftBase = data.leftPeriod?.from || new Date();
  const rightBase = data.rightPeriod?.from || new Date();
  const leftPeriodStr = formatPeriodString(data.leftPeriod);
  const rightPeriodStr = formatPeriodString(data.rightPeriod);

  // ── Column widths ──
  // Left DTR: cols 1–7 (A–G)
  // Spacer:   col 8 (H)
  // Right DTR: cols 9–15 (I–O)
  const widths = [5, 8, 8, 8, 8, 8, 8, 2, 5, 8, 8, 8, 8, 8, 9];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // ── Row heights ──
  // Header area
  for (let r = 1; r <= 11; r++) ws.getRow(r).height = 14;
  ws.getRow(3).height = 20; // "DAILY TIME RECORD"
  ws.getRow(5).height = 16; // Name
  // Spacer row
  ws.getRow(12).height = 15;
  // Table header rows
  ws.getRow(13).height = 15;
  ws.getRow(14).height = 15;
  // Data rows (compact)
  for (let r = 15; r <= 45; r++) ws.getRow(r).height = 16;
  // Bottom section rows need appropriate height
  for (let r = 46; r <= 60; r++) ws.getRow(r).height = 14;
  ws.getRow(46).height = 16;
  ws.getRow(47).height = 16;
  ws.getRow(48).height = 16;

  // Write the two identical DTR copies
  writeDTRCopy(ws, 1, data, leftBase, leftPeriodStr, data.leftPeriod, data.leftOfficialHours, data.leftRegularDaysHours, data.leftSaturdaysHours);   // Left  (A–G)
  writeDTRCopy(ws, 9, data, rightBase, rightPeriodStr, data.rightPeriod, data.rightOfficialHours, data.rightRegularDaysHours, data.rightSaturdaysHours);   // Right (I–O)

  // ── Employee Signature (1 signature, centered at bottom) ──
  ws.mergeCells(53, 5, 53, 11);
  const sigCell = ws.getCell(53, 5);
  sigCell.value = "SIGNATURE";
  sigCell.font = { name: "Arial", size: 10, bold: true };
  sigCell.alignment = { horizontal: "center" };
  sigCell.border = { top: { style: "medium" } };

  ws.mergeCells(54, 5, 54, 11);
  const verifiedCell = ws.getCell(54, 5);
  verifiedCell.value = "Verified as to the prescribed office hours.";
  verifiedCell.font = { name: "Arial", size: 10 };
  verifiedCell.alignment = { horizontal: "center", vertical: "top" };

  // ── Department Head (1 signature, centered at bottom) ──
  // Merging columns 5 to 11 provides a centered top-border line of appropriate width
  ws.mergeCells(59, 5, 59, 11);
  const headName = ws.getCell(59, 5);
  headName.value = "DAVE ANTHONY A. VERGARA, MD";
  headName.font = { name: "Arial", size: 10, bold: true };
  headName.alignment = { horizontal: "center" };
  headName.border = { top: { style: "medium" } };

  ws.mergeCells(60, 5, 60, 11);
  const headTitle = ws.getCell(60, 5);
  headTitle.value = "CITY GOVERNMENT DEPARTMENT HEAD III";
  headTitle.font = { name: "Arial", size: 9 };
  headTitle.alignment = { horizontal: "center", vertical: "top" };

  // ── Print area and Background fill ──
  ws.pageSetup.printArea = "A1:O60";
  
  // Fill the entire print area with white background and outside area with dark gray
  for (let r = 1; r <= 80; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= 26; c++) {
      const cell = row.getCell(c);
      
      const isInsidePrintArea = c <= 15 && r <= 60;
      
      if (!cell.fill) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isInsidePrintArea ? "FFFFFFFF" : "FF808080" }, // White inside, Dark Gray outside
        };
      } else if (!isInsidePrintArea) {
         // Force dark gray outside even if something else tried to fill it
         cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF808080" },
         };
      }
      
      // Apply gridlines and the blue borders to the outer edges of the print area
      if (isInsidePrintArea) {
        const currentBorder = cell.border ? { ...cell.border } : {};

        // Add faint gridlines for any side that doesn't already have a custom border (FFD4D4D4 = Gray lines)
        // if (!currentBorder.top) currentBorder.top = { style: "thin", color: { argb: "FFD4D4D4" } };
        // if (!currentBorder.left) currentBorder.left = { style: "thin", color: { argb: "FFD4D4D4" } };
        // if (!currentBorder.right) currentBorder.right = { style: "thin", color: { argb: "FFD4D4D4" } };
        // if (!currentBorder.bottom) currentBorder.bottom = { style: "thin", color: { argb: "FFD4D4D4" } };

        // Col 15 (O) -> Right side blue border (overrides the faint right gridline) (FF0000D0 = Blue)
        // if (c === 15) {
        //   currentBorder.right = { style: "thick", color: { argb: "FF0000D0" } };
        // }
        // Row 60 -> Bottom blue border (overrides the faint bottom gridline)
        // if (r === 60) {
        //   currentBorder.bottom = { style: "thick", color: { argb: "FF0000D0" } };
        // }

        cell.border = currentBorder;
      }
    }
  }

  // ── Download ──
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `DTR_${data.name.replace(/\s+/g, "_")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
