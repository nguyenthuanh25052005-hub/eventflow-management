import { CheckCircle2, Clock3, RefreshCw } from "lucide-react";

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Timeline({ event }) {
  const items = [
    {
      title: "Khởi tạo sự kiện",
      value: formatDateTime(event.createdAt),
      icon: Clock3,
    },
    {
      title: "Cập nhật gần nhất",
      value: formatDateTime(event.updatedAt),
      icon: RefreshCw,
    },
    {
      title: "Trạng thái hiện tại",
      value: String(event.status || "PENDING").replaceAll("_", " "),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="event-timeline">
      {items.map(({ title, value, icon: Icon }) => (
        <div className="event-timeline-item" key={title}>
          <div className="event-timeline-icon">
            <Icon size={18} />
          </div>

          <div>
            <strong>{title}</strong>
            <span>{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
