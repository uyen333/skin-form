// pages/index.js
import { useState } from "react";
import Head from "next/head";

const SKIN_TYPES = ["Da dầu", "Da khô", "Da hỗn hợp", "Da thường", "Da nhạy cảm", "Không rõ"];
const ISSUES = ["Mụn", "Thâm / nám", "Lỗ chân lông to", "Da xỉn màu", "Nhăn / lão hóa", "Da khô / bong tróc", "Da nhờn bóng", "Khác"];

const STEP_LABELS = [
  "Bước 1 / 3 — Thông tin cá nhân & Thói quen",
  "Bước 2 / 3 — Tình trạng & Lịch sử điều trị",
  "Bước 3 / 3 — Hướng dẫn chụp ảnh & Xác nhận",
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fix lỗi 1: Khai báo đầy đủ tất cả fields
  const [form, setForm] = useState({
    fullname: "",
    birthyear: "",
    location: "",
    job: "",
    environment: "",
    workIntensity: "",
    lifestyle: "",
    commute: "",
    skinType: "",
    issues: [],
    otherIssueText: "",
    treatmentHistory: "",
    futurePlans: "",
    confirmedZalo: false,
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
    if (step === 0) {
      if (!form.fullname.trim()) { setError("Vui lòng nhập họ tên của bạn"); return; }
      if (!form.birthyear.trim()) { setError("Vui lòng nhập năm sinh của bạn"); return; }
      if (!form.location.trim()) { setError("Vui lòng nhập nơi sinh sống của bạn"); return; }
      if (!form.job.trim()) { setError("Vui lòng nhập nghề nghiệp của bạn"); return; }
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
    if (!form.confirmedZalo) {
      setError("Vui lòng xác nhận đã gửi ảnh qua Zalo để tiếp tục");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Gộp "Khác" + text vào issues nếu có
      const issuesList = form.issues.map((i) =>
        i === "Khác" && form.otherIssueText.trim()
          ? `Khác (${form.otherIssueText.trim()})`
          : i
      );

      const payload = {
        ...form,
        issues: issuesList.join(", "),
        confirmedZalo: form.confirmedZalo ? "Đã gửi qua Zalo" : "Chưa gửi",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {submitted ? (
          <div className="success-wrap">
            <div className="success-icon">✓</div>
            <h1 className="success-title">Gửi thành công!</h1>
            <p className="success-sub">
              Cảm ơn bạn đã điền phiếu tư vấn.<br />
              Dr. Tố Nguyên đã nhận được thông tin của bạn.
            </p>
            <div className="success-note">
              Bác sĩ sẽ đối chiếu thông tin form này cùng các hình ảnh bạn đã gửi qua Zalo để tiến hành chẩn đoán và liên hệ lại với bạn sớm nhất nhé!
            </div>
          </div>
        ) : (
          <div className="form-card">
            {/* Header */}
            <div className="brand-header">
              <div className="brand-eyebrow">Dr. Tố Nguyên · Skincare Clinic</div>
              <h1 className="brand-title">Phiếu thông tin tư vấn da</h1>
              <p className="brand-sub">Vui lòng điền đầy đủ thông tin để bác sĩ xây dựng phác đồ cá nhân hóa chính xác nhất</p>
            </div>

            {/* Step indicator */}
            <div className="step-row">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`dot ${i < step ? "done" : i === step ? "active" : ""}`} />
              ))}
            </div>
            <div className="step-label">{STEP_LABELS[step]}</div>

            {/* Step 1 */}
            {step === 0 && (
              <div>
                <div className="form-section-title">Thông tin cơ bản</div>
                {/* ✅ Fix lỗi 3: Bỏ nth-of-type, dùng className riêng */}
                <div className="field-group-name-year">
                  <div className="field">
                    <label>Họ và tên (Tên Zalo) <span className="req">*</span></label>
                    <input value={form.fullname} onChange={(e) => update("fullname", e.target.value)} placeholder="Nguyễn Thị Hoa" />
                  </div>
                  <div className="field">
                    <label>Năm sinh <span className="req">*</span></label>
                    <input type="number" value={form.birthyear} onChange={(e) => update("birthyear", e.target.value)} placeholder="2003" min="1950" max="2026" />
                  </div>
                </div>

                <div className="field-group-2">
                  <div className="field">
                    <label>Nơi sinh sống hiện tại <span className="req">*</span></label>
                    <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Quận 1, TP.HCM" />
                  </div>
                  <div className="field">
                    <label>Nghề nghiệp <span className="req">*</span></label>
                    <input value={form.job} onChange={(e) => update("job", e.target.value)} placeholder="Nhân viên văn phòng" />
                  </div>
                </div>

                <div className="divider" />
                <div className="form-section-title">Đặc điểm môi trường & Sinh hoạt</div>

                <div className="field">
                  <label>Môi trường học tập / làm việc</label>
                  <input value={form.environment} onChange={(e) => update("environment", e.target.value)} placeholder="Phòng máy lạnh kín, ngồi máy tính nhiều, ngoài trời bụi bặm..." />
                </div>
                <div className="field">
                  <label>Cường độ làm việc & Mức độ áp lực</label>
                  <input value={form.workIntensity} onChange={(e) => update("workIntensity", e.target.value)} placeholder="Cao (thường xuyên OT, stress), Bình thường..." />
                </div>
                <div className="field">
                  <label>Thói quen sinh hoạt</label>
                  <input value={form.lifestyle} onChange={(e) => update("lifestyle", e.target.value)} placeholder="Hay thức khuya (ngủ lúc 1h sáng), lười uống nước, ăn đồ cay nóng..." />
                </div>
                <div className="field">
                  <label>Cách thức di chuyển hàng ngày</label>
                  <input value={form.commute} onChange={(e) => update("commute", e.target.value)} placeholder="Chạy xe máy tầm 45 phút tiếp xúc khói bụi, đi ô tô..." />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <div>
                <div className="form-section-title">Nhận định tình trạng da</div>
                <div className="field">
                  <label>Bạn tự nhận thấy da mình thuộc loại nào? <span className="req">*</span></label>
                  <div className="options-grid">
                    {SKIN_TYPES.map((t) => (
                      <button key={t} className={`option-card ${form.skinType === t ? "selected" : ""}`} onClick={() => update("skinType", t)}>
                        {form.skinType === t ? "✓ " : ""}{t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Các vấn đề da đang gặp phải <span className="hint">(có thể chọn nhiều)</span></label>
                  <div className="options-grid">
                    {ISSUES.map((issue) => (
                      <button key={issue} className={`option-card ${form.issues.includes(issue) ? "selected" : ""}`} onClick={() => toggleIssue(issue)}>
                        {form.issues.includes(issue) ? "✓ " : ""}{issue}
                      </button>
                    ))}
                  </div>
                  {/* ✅ Fix lỗi 2: Hiện ô nhập text khi chọn "Khác" */}
                  {form.issues.includes("Khác") && (
                    <input
                      style={{ marginTop: "10px" }}
                      value={form.otherIssueText}
                      onChange={(e) => update("otherIssueText", e.target.value)}
                      placeholder="Vui lòng mô tả vấn đề da khác của bạn..."
                    />
                  )}
                </div>

                <div className="divider" />
                <div className="form-section-title">Tiền sử & Định hướng điều trị</div>

                <div className="field">
                  <label>Lịch sử điều trị da trước đây <span className="hint">(không bắt buộc)</span></label>
                  <textarea value={form.treatmentHistory} onChange={(e) => update("treatmentHistory", e.target.value)} placeholder="Ví dụ: Đã từng điều trị mụn tại clinic X, từng peel da sinh học cách đây 3 tháng..." />
                </div>
                <div className="field">
                  <label>Dự định trong tương lai gần <span className="hint">(không bắt buộc)</span></label>
                  <textarea value={form.futurePlans} onChange={(e) => update("futurePlans", e.target.value)} placeholder="Ví dụ: Có kế hoạch mang thai trong 3 tháng tới, chuẩn bị đám cưới vào tháng sau..." />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div>
                <div className="form-section-title" style={{ color: "#e11d48" }}>Hướng dẫn chụp ảnh (Quan trọng)</div>
                <div className="photo-guide-container">
                  <div className="guide-block">
                    <div className="guide-subtitle">1. Ảnh chụp tình trạng da:</div>
                    <ul>
                      <li><strong>Đối với da mặt:</strong> Ảnh mặt mộc hoàn toàn, chụp rõ nét. Cần chụp đủ <strong>3 tấm</strong>: góc nghiêng trái, góc nghiêng phải và chính diện.</li>
                      <li><strong>Đối với da đầu và cơ thể:</strong> Chụp cận cảnh rõ nét vùng da đang gặp vấn đề.</li>
                    </ul>
                  </div>
                  <div className="guide-block" style={{ marginTop: "1rem" }}>
                    <div className="guide-subtitle">2. Ảnh chụp sản phẩm & Đơn thuốc:</div>
                    <ul>
                      <li>Chụp rõ nhãn mác <strong>các sản phẩm dưỡng da đang dùng</strong>, kèm thứ tự dùng sáng/trưa/tối.</li>
                      <li>Chụp rõ <strong>toa thuốc</strong> đang uống điều trị gần đây (nếu có).</li>
                    </ul>
                  </div>
                </div>

                <div className="divider" />

                <div className="zalo-profile-card animate-fade">
                  <div className="zalo-user-info">
                    <img src="/avatarzalo.jpg" alt="Dr. Tố Nguyên Avatar" className="zalo-avatar-thumb" />
                    <div className="zalo-user-meta">
                      <h4 className="zalo-name">Dr. Tố Nguyên</h4>
                      <span className="zalo-status">🟢 Đang hoạt động tư vấn</span>
                    </div>
                  </div>
                  <div className="qr-inline-content">
                    <p className="qr-inline-sub">💬 Quét mã Zalo dưới đây để gửi hình tình trạng da nhé</p>
                    <div className="qr-inline-zone">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://zalo.me/0xxxxxxxxx"
                        alt="Zalo QR Code"
                        className="qr-inline-img"
                      />
                    </div>
                  </div>
                </div>

                <div className="field style-checkbox-container">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.confirmedZalo} onChange={(e) => update("confirmedZalo", e.target.checked)} className="real-checkbox" />
                    <span className="custom-checkbox-box"></span>
                    <span className="checkbox-text">Xác nhận đã gửi các ảnh chụp theo hướng dẫn qua Zalo cho Dr. Tố Nguyên</span>
                  </label>
                </div>
              </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            <div className="nav-row">
              {step > 0 && <button className="btn-back" onClick={goBack}>← Quay lại</button>}
              {step < 2 ? (
                <button className="btn-next" onClick={goNext}>Tiếp theo →</button>
              ) : (
                <button className="btn-next" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi phiếu xác nhận ✓"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f4f6f9; min-height: 100vh; color: #1a1a1a; }
        .page { min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem 4rem; }
        .form-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 2.5rem 2rem; width: 100%; max-width: 580px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .brand-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .brand-eyebrow { font-size: 11px; letter-spacing: 0.15em; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 500; }
        .brand-title { font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .brand-sub { font-size: 13px; color: #475569; line-height: 1.6; }
        .form-section-title { font-size: 14px; font-weight: 700; color: #0F4C81; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .step-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
        .dot { height: 6px; border-radius: 3px; background: #e2e8f0; transition: all 0.3s; width: 6px; }
        .dot.active { background: #0F4C81; width: 22px; }
        .dot.done { background: #0F4C81; }
        .step-label { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 1.75rem; font-weight: 500; }

        /* ✅ Fix lỗi 3: 2 grid riêng biệt, không dùng nth-of-type */
        .field-group-name-year { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
        .field-group-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .field { margin-bottom: 1.25rem; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .field label .req { color: #e11d48; }
        .field label .hint { font-weight: 400; color: #94a3b8; font-size: 12px; }
        .field input, .field textarea { width: 100%; padding: 11px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; color: #0f172a; background: #fff; transition: all 0.2s; }
        .field input:focus, .field textarea:focus { outline: none; border-color: #0F4C81; box-shadow: 0 0 0 3px rgba(15,76,129,0.15); }
        .field textarea { resize: vertical; min-height: 90px; line-height: 1.6; }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-top: 4px; }
        .option-card { padding: 11px 12px; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; font-size: 13px; color: #334155; background: #fff; font-family: 'Inter', sans-serif; transition: all 0.15s; text-align: center; font-weight: 500; }
        .option-card:hover { border-color: #0F4C81; background: #f0f7fc; color: #0F4C81; }
        .option-card.selected { border-color: #0F4C81; background: #e0f2fe; color: #0F4C81; font-weight: 600; }
        .divider { height: 1px; background: #e2e8f0; margin: 1.5rem 0; }
        .photo-guide-container { background: #fffdfa; border: 1px solid #fef3c7; border-radius: 10px; padding: 16px; }
        .guide-block { font-size: 13.5px; color: #334155; line-height: 1.7; }
        .guide-subtitle { font-weight: 700; color: #b45309; margin-bottom: 4px; }
        .guide-block ul { padding-left: 1.25rem; }
        .guide-block li { margin-bottom: 4px; }
        .style-checkbox-container { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-top: 1.5rem; }
        .checkbox-label { display: flex !important; align-items: flex-start; gap: 10px; cursor: pointer; user-select: none; margin-bottom: 0 !important; }
        .real-checkbox { display: none; }
        .custom-checkbox-box { width: 18px; height: 18px; border: 2px solid #16a34a; border-radius: 4px; display: inline-block; flex-shrink: 0; position: relative; margin-top: 2px; transition: all 0.2s; background: #fff; }
        .real-checkbox:checked + .custom-checkbox-box { background: #16a34a; }
        .real-checkbox:checked + .custom-checkbox-box::after { content: "✓"; position: absolute; color: #fff; font-size: 13px; font-weight: 700; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .checkbox-text { font-size: 13.5px; color: #166534; font-weight: 600; line-height: 1.5; }
        .error-msg { color: #e11d48; font-size: 13px; margin-top: 0.75rem; text-align: center; font-weight: 500; }
        .nav-row { display: flex; gap: 10px; margin-top: 1.75rem; }
        .btn-next { flex: 1; padding: 12px; background: #0F4C81; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; transition: background 0.2s; }
        .btn-next:hover:not(:disabled) { background: #0B355B; }
        .btn-next:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-back { padding: 12px 18px; background: transparent; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #64748b; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; font-weight: 500; }
        .btn-back:hover { border-color: #94a3b8; color: #334155; background: #f8fafc; }
        .success-wrap { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 3rem 2rem; width: 100%; max-width: 480px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: #e0f2fe; color: #0F4C81; font-size: 28px; font-weight: 600; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
        .success-title { font-size: 24px; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; }
        .success-sub { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 1.5rem; }
        .success-note { background: #f0f7fc; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #0F4C81; line-height: 1.7; font-weight: 500; }
        .zalo-profile-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; margin: 1rem 0 1.5rem 0; box-shadow: 0 4px 20px rgba(0,104,255,0.04); }
        .zalo-user-info { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 12px; }
        .zalo-avatar-thumb { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #0068ff; }
        .zalo-user-meta { display: flex; flex-direction: column; }
        .zalo-name { font-size: 14.5px; font-weight: 700; color: #1e293b; margin: 0; }
        .zalo-status { font-size: 11px; color: #64748b; margin-top: 2px; }
        .qr-inline-content { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
        .qr-inline-sub { font-size: 12px; color: #475569; font-weight: 500; margin-bottom: 8px; }
        .qr-inline-zone { background: #ffffff; padding: 8px; border-radius: 10px; border: 1px solid #f1f5f9; box-shadow: 0 4px 10px rgba(0,0,0,0.03); display: inline-block; transition: transform 0.2s; }
        .qr-inline-zone:hover { transform: scale(1.03); }
        .qr-inline-img { width: 140px; height: 140px; display: block; }
        .animate-fade { animation: fadeInForm 0.3s ease-out forwards; }
        @keyframes fadeInForm { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 580px) {
          .field-group-name-year, .field-group-2 { grid-template-columns: 1fr !important; gap: 0; }
          .form-card, .success-wrap { padding: 1.75rem 1.25rem; }
          .options-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}