// pages/api/submit-form.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = req.body;

    // THAY ĐOẠN LINK DƯỚI ĐÂY THÀNH LINK URL BÀ VỪA COPY Ở BƯỚC 1 NHÉ
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM9-k2TBLCAJDeVNHPrRkJBkhfYtXXujpQgDMIzTaacpuHV0_Mxd_iWFrII0lGciJi/exec";

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: data.error });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}