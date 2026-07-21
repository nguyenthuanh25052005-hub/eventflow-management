import api from "./axios";

const eventApi = {
  getAll(params = {}) {
    return api.get("/events", { params });
  },

  getMy(params = {}) {
    return api.get("/events/my", { params });
  },

  getById(id) {
    return api.get(`/events/${id}`);
  },

  create(data) {
    return api.post("/events", data);
  },

  update(id, data) {
    return api.put(`/events/${id}`, data);
  },
};

export default eventApi;
