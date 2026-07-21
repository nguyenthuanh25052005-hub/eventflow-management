import api from "./axios";

const eventRequestApi = {
  getAll(params = {}) {
    return api.get("/event-requests", { params });
  },

  getMy(params = {}) {
    return api.get("/event-requests/my", { params });
  },

  getById(id) {
    return api.get(`/event-requests/${id}`);
  },

  create(data) {
    return api.post("/event-requests", data);
  },

  updateStatus(id, status) {
    return api.put(`/event-requests/${id}/status`, { status });
  },
};

export default eventRequestApi;
