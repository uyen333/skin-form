// pages/api/submit-form.js
// API route nhận data từ form và gửi lên Google Apps Script

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!APPS_SCRIPT_URL) {
    console.error("Missing GOOGLE_APPS_SCRIPT_URL env variable");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res
        .status(500)
        .json({ error: result.error || "Lỗi không xác định" });
    }
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({ error: "Không thể kết nối server" });
  }
}
