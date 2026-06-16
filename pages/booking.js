// pages/booking.js
import { useState } from "react";
import Head from "next/head";

// 1. Cấu hình danh sách ngày bận và giờ bận tương ứng của Bác sĩ
// Định dạng: "YYYY-MM-DD": ["CÁC_KHUNG_GIỜ_ĐÃ_KÍN"]
const BUSY_SCHEDULE = {
  "2026-06-10": ["09:00", "10:00", "14:00"],
  "2026-06-12": ["11:00", "15:00", "16:00"],
  "2026-06-15": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"], // Ngày này kín sạch
  "2026-06-20": ["10:00", "14:00"],
  "2026-06-28": ["09:00", "16:00"],
};

// Tất cả khung giờ khám cố định trong ngày của phòng khám
const ALL_TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

export default function Booking() {
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Logic hiển thị lịch (Tháng 6/2026)
  const currentYear = 2026;
  const currentMonth = 5; // Tháng 6 trong JS
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);

  // Lấy danh sách giờ đã kín của ngày đang chọn
  const getBusySlotsForDate = (dateStr) => {
    return BUSY_SCHEDULE[dateStr] || [];
  };

  // Kiểm tra xem một ngày cụ thể có bị kín toàn bộ giờ hay không
  const isDateFullyBooked = (dateStr) => {
    const busySlots = getBusySlotsForDate(dateStr);
    return busySlots.length >= ALL_TIME_SLOTS.length;
  };

  const handleCellClick = (day) => {
    if (!day) return;
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayStr = new Date().toISOString().split("T")[0];

    if (dateStr < todayStr) {
      setError("Không thể đặt lịch hẹn cho những ngày đã qua nha bà!");
      return;
    }

    if (isDateFullyBooked(dateStr)) {
      setError("Ngày này bác sĩ đã kín hết tất cả các khung giờ rồi. Bà chọn ngày khác nha!");
      return;
    }

    setError("");
    setSelectedDate(dateStr);
    setSelectedTime(""); // Reset lại giờ khi đổi sang ngày mới
  };

  const handleTimeSelect = (time) => {
    const busySlots = getBusySlotsForDate(selectedDate);
    if (busySlots.includes(time)) {
      setError(`Khung giờ ${time} này đã có khách đặt rồi bà ơi!`);
      return;
    }
    setError("");
    setSelectedTime(time);
  };

  const validatePhone = (p) => {
    const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/g;
    return phoneRegex.test(p);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError("Vui lòng chọn một ngày trên lịch.");
      return;
    }
    if (!selectedTime) {
      setError("Vui lòng chọn khung giờ bạn muốn đến khám.");
      return;
    }
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại liên hệ.");
      return;
    }
    if (!validatePhone(phone.trim())) {
      setError("Số điện thoại chưa đúng định dạng 10 số rồi bà ơi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/submit-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          date: selectedDate,
          time: selectedTime,
          timestamp: new Date().toLocaleString("vi-VN"),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError("Có lỗi xảy ra khi lưu lịch hẹn. Thử lại nhé bà!");
      }
    } catch {
      setError("Không thể kết nối internet. Vui lòng kiểm tra lại mạng.");
    } finally {
      setLoading(false);
    }
  };

  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <>
      <Head>
        <title>Đặt lịch hẹn xịn | Dr. Tố Nguyên</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {submitted ? (
          <div className="success-wrap">
            <div className="success-icon">✓</div>
            <h1 className="success-title">Đặt lịch thành công!</h1>
            <p className="success-sub">
              Lịch hẹn: <strong>{selectedTime}</strong> ngày <strong>{selectedDate.split('-').reverse().join('/')}</strong> của bà đã được găm chỗ thành công!
            </p>
            <div className="success-note">
              Trợ lý bác sĩ sẽ gọi điện xác nhận qua số <strong>{phone}</strong> ngay lập tức nha!
            </div>
          </div>
        ) : (
          <div className="booking-card">
            {/* Header */}
            <div className="brand-header">
              <div className="brand-eyebrow">Dr. Tố Nguyên · Appointment</div>
              <h1 className="brand-title">Đặt lịch hẹn tư vấn</h1>
              <p className="brand-sub">Bấm chọn ngày trống trên lịch để hiển thị các khung giờ còn nhận khách</p>
            </div>

            {/* UI Lịch */}
            <div className="calendar-container">
              <div className="calendar-header">
                <span className="month-label">{monthNames[currentMonth]} {currentYear}</span>
                <div className="status-indicators">
                  <span className="status-item"><i className="dot-available"></i> Trống</span>
                  <span className="status-item"><i className="dot-full"></i> Kín</span>
                </div>
              </div>

              <div className="weekdays-grid">
                {weekdays.map((w) => <div key={w} className="weekday-name">{w}</div>)}
              </div>

              <div className="days-grid">
                {calendarCells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="day-cell empty"></div>;

                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isFull = isDateFullyBooked(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isPast = dateStr < todayStr;

                  let cellClass = "day-cell";
                  if (isPast) cellClass += " past";
                  else if (isFull) cellClass += " full";
                  else cellClass += " available";
                  if (isSelected) cellClass += " selected";

                  return (
                    <div key={`day-${day}`} className={cellClass} onClick={() => handleCellClick(day)}>
                      <span className="day-number">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOÀN TOÀN TỰ ĐỘNG DROPDOWN KHI CHỌN NGÀY */}
            {selectedDate && (
              <div className="dropdown-time-section animate-fade">
                <div className="section-title">
                  Khung giờ trống ngày {selectedDate.split('-').reverse().join('/')}:
                </div>
                
                <div className="time-slots-grid">
                  {ALL_TIME_SLOTS.map((time) => {
                    const isSlotBusy = getBusySlotsForDate(selectedDate).includes(time);
                    const isTimeSelected = selectedTime === time;
                    
                    let slotClass = "time-slot-btn";
                    if (isSlotBusy) slotClass += " slot-busy";
                    else slotClass += " slot-available";
                    if (isTimeSelected) slotClass += " slot-selected";

                    return (
                      <button
                        key={time}
                        type="button"
                        className={slotClass}
                        onClick={() => handleTimeSelect(time)}
                        disabled={isSlotBusy}
                      >
                        {time}
                        {isSlotBusy && <span className="busy-tag">Kín</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} style={{ marginTop: "1rem" }}>
              {/* Cụm thông tin chốt hạ */}
              {selectedDate && selectedTime && (
                <div className="selected-summary">
                  Lịch lựa chọn: <span>{selectedTime}</span> ngày <span>{selectedDate.split('-').reverse().join('/')}</span>
                </div>
              )}

              {/* Input SĐT */}
              <div className="field">
                <label>Số điện thoại của bạn <span className="req">*</span></label>
                <input 
                  type="tel" 
                  placeholder="Nhập số điện thoại để bác sĩ gọi lại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="btn-submit" disabled={loading || !selectedDate || !selectedTime}>
                {loading ? "Đang lưu thông tin..." : "Xác nhận đặt lịch ngay ✓"}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f4f6f9; min-height: 100vh; color: #1a1a1a; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
        
        .booking-card {
          background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
          padding: 2.5rem 2rem; width: 100%; max-width: 480px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .brand-header { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
        .brand-eyebrow { font-size: 11px; letter-spacing: 0.15em; color: #64748b; text-transform: uppercase; margin-bottom: 0.4rem; font-weight: 500; }
        .brand-title { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 0.4rem; letter-spacing: -0.02em; }
        .brand-sub { font-size: 13px; color: #475569; line-height: 1.5; }
        
        .calendar-container { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; background: #f8fafc; }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .month-label { font-size: 14px; font-weight: 700; color: #0f172a; }
        .status-indicators { display: flex; gap: 10px; font-size: 11px; color: #64748b; }
        .status-indicators span { display: flex; align-items: center; gap: 4px; }
        .dot-available { width: 7px; height: 7px; border-radius: 50%; background: #0F4C81; display: inline-block; }
        .dot-full { width: 7px; height: 7px; border-radius: 50%; background: #cbd5e1; display: inline-block; }

        .weekdays-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 6px; }
        .weekday-name { font-size: 11px; font-weight: 600; color: #94a3b8; }

        .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .day-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .day-cell.empty { cursor: default; }
        .day-cell.past { color: #cbd5e1; cursor: not-allowed; }
        .day-cell.full { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; text-decoration: line-through; }
        .day-cell.available { background: #fff; border: 1px solid #e2e8f0; color: #334155; }
        .day-cell.available:hover { border-color: #0F4C81; background: #f0f7fc; color: #0F4C81; }
        .day-cell.selected { background: #0F4C81 !important; color: #fff !important; font-weight: 700; }

        /* Dropdown CSS hiệu ứng trượt mở khung giờ */
        .dropdown-time-section { margin-top: 1.5rem; background: #fafafa; border: 1px solid #eaebed; border-radius: 10px; padding: 14px; }
        .section-title { font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.02em; }
        
        .time-slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .time-slot-btn {
          padding: 10px 6px; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif;
          font-weight: 600; cursor: pointer; transition: all 0.15s; text-align: center;
          display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
        }
        .slot-available { background: #fff; border: 1px solid #cbd5e1; color: #334155; }
        .slot-available:hover { border-color: #0F4C81; color: #0F4C81; background: #f0f7fc; }
        
        .slot-busy { background: #f1f1f2; border: 1px solid #e2e8f0; color: #94a3b8; cursor: not-allowed; }
        .busy-tag { font-size: 9px; font-weight: 400; color: #ef4444; background: #fee2e2; padding: 1px 4px; border-radius: 4px; margin-top: 2px; text-transform: uppercase; }
        
        .slot-selected { background: #0F4C81 !important; border-color: #0F4C81 !important; color: #fff !important; }
        .slot-selected .busy-tag { display: none; }

        .selected-summary {
          background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;
          padding: 10px; border-radius: 8px; font-size: 13px; text-align: center; margin-bottom: 1rem; font-weight: 500;
        }
        .selected-summary span { font-weight: 700; }

        .animate-fade { animation: slideDown 0.25s ease-out forwards; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .field { margin-bottom: 1.25rem; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .field label .req { color: #e11d48; }
        .field input { width: 100%; padding: 11px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; font-family: 'Inter', sans-serif; color: #0f172a; }
        .field input:focus { outline: none; border-color: #0F4C81; box-shadow: 0 0 0 3px rgba(15, 76, 129, 0.15); }

        .error-msg { color: #e11d48; font-size: 13px; margin: 0.5rem 0; text-align: center; font-weight: 500; }
        .btn-submit { width: 100%; padding: 13px; background: #0F4C81; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .success-wrap { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 3rem 2rem; text-align: center; width: 100%; max-width: 440px; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-weight: 600; }
        .success-title { font-size: 24px; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; }
        .success-sub { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 1.5rem; }
        .success-note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; font-size: 13px; color: #166534; font-weight: 500; }
        
        @media (max-width: 440px) { .booking-card, .success-wrap { padding: 1.5rem 1rem; } .time-slots-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </>
  );
}