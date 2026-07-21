const STATUS_MAP = {
  PENDING: { label: "Chờ xử lý", className: "status-pending" },
  CONSULTING: { label: "Đang tư vấn", className: "status-consulting" },
  CONVERTED: { label: "Đã chuyển thành sự kiện", className: "status-converted" },
  PLANNING: { label: "Đang lên kế hoạch", className: "status-planning" },
  IN_PROGRESS: { label: "Đang diễn ra", className: "status-progressing" },
  COMPLETED: { label: "Hoàn thành", className: "status-completed" },
  REJECTED: { label: "Từ chối", className: "status-rejected" },
  CANCELLED: { label: "Đã hủy", className: "status-cancelled" },
};

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "PENDING").toUpperCase();
  const metadata = STATUS_MAP[normalizedStatus] || {
    label: normalizedStatus.replaceAll("_", " "),
    className: "status-default",
  };

  return (
    <span className={`event-status-badge ${metadata.className}`}>
      {metadata.label}
    </span>
  );
}

export default StatusBadge;
