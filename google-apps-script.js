// ============================================================
// GOOGLE APPS SCRIPT — Dán vào Extensions > Apps Script
// trong Google Sheet của bạn
// ============================================================
// Sau khi dán xong:
// 1. Nhấn "Deploy" > "New deployment"
// 2. Chọn type: "Web app"
// 3. Execute as: "Me"
// 4. Who has access: "Anyone"
// 5. Nhấn Deploy, copy URL dán vào .env.local của Next.js
// ============================================================

const SHEET_NAME = "Phiếu tư vấn"; // Tên sheet tab trong Google Sheet

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // Tạo header nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian",
        "Họ tên (Zalo)",
        "Năm sinh",
        "Loại da",
        "Vấn đề gặp phải",
        "Đã dùng serum/thuốc rượu",
        "Đã làm liệu trình",
        "Uống trà sữa / đồ ngọt",
        "Khả năng tài chính",
      ]);

      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#0F6E56");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Ghi dữ liệu vào hàng mới
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("vi-VN"),
      data.fullname || "",
      data.birthyear || "",
      data.skinType || "",
      data.issues || "",
      data.serumUsed || "",
      data.treatments || "",
      data.sweetDrink || "",
      data.budget || "",
    ]);

    // Auto resize columns
    sheet.autoResizeColumns(1, 9);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Đã lưu thành công!" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

// Hàm test thủ công (chạy trong editor để kiểm tra)
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: "01/06/2026, 10:00:00",
        fullname: "Nguyễn Thị Test",
        birthyear: "1995",
        skinType: "Da dầu",
        issues: "Mụn, Thâm / nám",
        serumUsed: "Vitamin C serum",
        treatments: "Chưa làm",
        sweetDrink: "Thỉnh thoảng",
        budget: "2 – 5 triệu",
      }),
    },
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
