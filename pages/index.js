// pages/index.js
import { useState } from "react";
import Head from "next/head";

const SKIN_TYPES = ["Da dầu", "Da khô", "Da hỗn hợp", "Da thường", "Da nhạy cảm", "Không rõ"];
const ISSUES = ["Mụn", "Thâm / nám", "Lỗ chân lông to", "Da xỉn màu", "Nhăn / lão hóa", "Da khô / bong tróc", "Da nhờn bóng", "Khác"];
const SWEET_OPTIONS = ["Thường xuyên", "Thỉnh thoảng", "Hiếm khi", "Không dùng"];
const BUDGET_OPTIONS = ["Dưới 2 triệu", "2 – 5 triệu", "5 – 10 triệu", "Trên 10 triệu"];

const STEP_LABELS = [
  "Bước 1 / 3 — Thông tin cá nhân",
  "Bước 2 / 3 — Tình trạng da",
  "Bước 3 / 3 — Lối sống & tài chính",
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullname: "",
    birthyear: "",
    skinType: "",
    issues: [],
    serumUsed: "",
    treatments: "",
    sweetDrink: "",
    budget: "",
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleIssue = (issue) => {
    setForm((f) => ({
      ...f,
      issues: f.issues.includes(issue)
        ? f.issues.filter((i) => i !== issue)
        : [...f.issues, issue],
    }));
  };

  const goNext = () => {
    if (step === 0 && !form.fullname.trim()) {
      setError("Vui lòng nhập họ tên của bạn");
      return;
    }
    setError("");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError("");
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        issues: form.issues.join(", "),
        timestamp: new Date().toLocaleString("vi-VN"),
      };

      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("Có lỗi xảy ra: " + (data.error || "Thử lại nhé!"));
      }
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Phiếu tư vấn da | Dr. Tố Nguyên</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {submitted ? (
          <div className="success-wrap">
            <div className="success-icon">✓</div>
            <h1 className="success-title">Gửi thành công!</h1>
            <p className="success-sub">
              Cảm ơn bạn đã điền phiếu tư vấn.<br />
              Dr. Tố Nguyên sẽ liên hệ sớm nhất có thể.
            </p>
            <div className="success-note">
              Nhớ gửi <strong>6 ảnh mặt mộc</strong> qua Zalo nhé!<br />
              <span className="note-small">3 ảnh không flash + 3 ảnh có flash · Góc chính diện, trái, phải</span>
            </div>
          </div>
        ) : (
          <div className="form-card">
            {/* Header */}
            <div className="brand-header">
              <div className="brand-eyebrow">Dr. Tố Nguyên · Skincare Clinic</div>
              <h1 className="brand-title">Phiếu thông tin tư vấn da</h1>
              <p className="brand-sub">Vui lòng điền đầy đủ để bác sĩ tư vấn chính xác nhất cho bạn</p>
            </div>

            {/* Step indicator */}
            <div className="step-row">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`dot ${i < step ? "done" : i === step ? "active" : ""}`} />
              ))}
            </div>
            <div className="step-label">{STEP_LABELS[step]}</div>

            {/* Step 0 */}
            {step === 0 && (
              <div>
                <div className="field">
                  <label>Họ và tên đầy đủ (tên Zalo) <span className="req">*</span></label>
                  <input value={form.fullname} onChange={(e) => update("fullname", e.target.value)} placeholder="Nguyễn Thị Hoa" />
                </div>
                <div className="field">
                  <label>Năm sinh</label>
                  <input type="number" value={form.birthyear} onChange={(e) => update("birthyear", e.target.value)} placeholder="1995" min="1960" max="2010" />
                </div>
                <div className="field">
                  <label>Loại da của bạn <span className="req">*</span></label>
                  <div className="options-grid">
                    {SKIN_TYPES.map((t) => (
                      <button key={t} className={`option-card ${form.skinType === t ? "selected" : ""}`} onClick={() => update("skinType", t)}>
                        {form.skinType === t ? "✓ " : ""}{t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div>
                <div className="field">
                  <label>Các vấn đề bạn đang gặp phải <span className="hint">(chọn nhiều)</span></label>
                  <div className="options-grid">
                    {ISSUES.map((issue) => (
                      <button key={issue} className={`option-card ${form.issues.includes(issue) ? "selected" : ""}`} onClick={() => toggleIssue(issue)}>
                        {form.issues.includes(issue) ? "✓ " : ""}{issue}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divider" />
                <div className="field">
                  <label>Bạn đã từng dùng thuốc rượu, serum...?</label>
                  <textarea value={form.serumUsed} onChange={(e) => update("serumUsed", e.target.value)} placeholder="Ví dụ: serum vitamin C, retinol, acid toner..." />
                </div>
                <div className="field">
                  <label>Bạn đã từng làm liệu trình nào?</label>
                  <textarea value={form.treatments} onChange={(e) => update("treatments", e.target.value)} placeholder="Ví dụ: lăn kim, peel, meso, laser..." />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <div className="field">
                  <label>Bạn có thường xuyên uống trà sữa, đồ ngọt...?</label>
                  <div className="options-grid">
                    {SWEET_OPTIONS.map((o) => (
                      <button key={o} className={`option-card ${form.sweetDrink === o ? "selected" : ""}`} onClick={() => update("sweetDrink", o)}>
                        {form.sweetDrink === o ? "✓ " : ""}{o}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Khả năng tài chính của bạn (mỗi tháng)</label>
                  <div className="options-grid">
                    {BUDGET_OPTIONS.map((b) => (
                      <button key={b} className={`option-card ${form.budget === b ? "selected" : ""}`} onClick={() => update("budget", b)}>
                        {form.budget === b ? "✓ " : ""}{b}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divider" />
                <div className="field">
                  <label>Ảnh mặt mộc</label>
                  <div className="photo-note">
                    <strong>Gửi 6 ảnh qua Zalo sau khi điền form:</strong>
                    <ul>
                      <li>3 ảnh <strong>không đèn flash</strong> (chính diện, trái, phải)</li>
                      <li>3 ảnh <strong>có đèn flash</strong> (chính diện, trái, phải)</li>
                    </ul>
                    <span className="note-green">Điện thoại cách mặt chưa tới 2 gang tay · Nơi đủ sáng chiếu vào mặt</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && <div className="error-msg">{error}</div>}

            {/* Navigation */}
            <div className="nav-row">
              {step > 0 && (
                <button className="btn-back" onClick={goBack}>← Quay lại</button>
              )}
              {step < 2 ? (
                <button className="btn-next" onClick={goNext}>Tiếp theo →</button>
              ) : (
                <button className="btn-next" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi phiếu ✓"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: #f5f5f0;
          min-height: 100vh;
          color: #1a1a1a;
        }
        .page {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem 4rem;
        }
        .form-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8e8e4;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .brand-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0ec; }
        .brand-eyebrow { font-size: 11px; letter-spacing: 0.15em; color: #888; text-transform: uppercase; margin-bottom: 0.5rem; }
        .brand-title { font-family: 'DM Serif Display', serif; font-size: 26px; font-weight: 400; color: #1a1a1a; margin-bottom: 0.5rem; }
        .brand-sub { font-size: 13px; color: #666; line-height: 1.6; }
        .step-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
        .dot { height: 6px; border-radius: 3px; background: #e0e0da; transition: all 0.3s; width: 6px; }
        .dot.active { background: #1D9E75; width: 22px; }
        .dot.done { background: #1D9E75; }
        .step-label { text-align: center; font-size: 12px; color: #888; margin-bottom: 1.75rem; }
        .field { margin-bottom: 1.25rem; }
        .field label { display: block; font-size: 13px; font-weight: 500; color: #444; margin-bottom: 6px; }
        .field label .req { color: #D85A30; }
        .field label .hint { font-weight: 400; color: #aaa; font-size: 12px; }
        .field input, .field textarea {
          width: 100%; padding: 10px 12px;
          border: 1px solid #e0e0da; border-radius: 8px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1a1a1a; background: #fff;
          transition: border-color 0.2s;
        }
        .field input:focus, .field textarea:focus {
          outline: none; border-color: #1D9E75;
          box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
        }
        .field textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
        .option-card {
          padding: 9px 12px; border: 1px solid #e0e0da;
          border-radius: 8px; cursor: pointer;
          font-size: 13px; color: #444; background: #fff;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; text-align: center;
        }
        .option-card:hover { border-color: #1D9E75; background: #f0faf6; color: #0F6E56; }
        .option-card.selected { border-color: #1D9E75; background: #e8f7f2; color: #0F6E56; font-weight: 500; }
        .divider { height: 1px; background: #f0f0ec; margin: 1.25rem 0; }
        .photo-note {
          background: #f8f8f4; border: 1px solid #e8e8e4;
          border-radius: 8px; padding: 14px 16px;
          font-size: 13px; color: #555; line-height: 1.8;
        }
        .photo-note ul { padding-left: 1.2rem; margin-top: 6px; }
        .note-green { color: #0F6E56; font-size: 12px; display: block; margin-top: 6px; }
        .error-msg { color: #D85A30; font-size: 13px; margin-top: 0.75rem; text-align: center; }
        .nav-row { display: flex; gap: 10px; margin-top: 1.75rem; }
        .btn-next {
          flex: 1; padding: 12px;
          background: #1D9E75; color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-next:hover:not(:disabled) { background: #0F6E56; }
        .btn-next:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-back {
          padding: 12px 18px; background: transparent;
          border: 1px solid #e0e0da; border-radius: 8px;
          font-size: 14px; color: #888;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .btn-back:hover { border-color: #aaa; color: #444; }
        .success-wrap {
          background: #fff; border-radius: 16px;
          border: 1px solid #e8e8e4; padding: 3rem 2rem;
          width: 100%; max-width: 480px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: #e8f7f2; color: #1D9E75;
          font-size: 28px; font-weight: 500;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .success-title { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; margin-bottom: 0.5rem; }
        .success-sub { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 1.5rem; }
        .success-note { background: #f0faf6; border: 1px solid #c8ede3; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #0F6E56; line-height: 1.7; }
        .note-small { font-size: 12px; color: #888; }
        @media (max-width: 480px) {
          .form-card, .success-wrap { padding: 1.75rem 1.25rem; }
          .options-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
