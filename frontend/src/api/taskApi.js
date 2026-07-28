import api from "./axios";

const taskApi = {
  getAll(params = {}) {
    return api.get("/tasks", {
      params,
    });
  },

  getByEvent(eventId, params = {}) {
    if (!eventId) {
      throw new Error("eventId là bắt buộc.");
    }

    return api.get(`/tasks/event/${eventId}`, {
      params,
    });
  },

  create(data) {
    return api.post("/tasks", data);
  },

  update(id, data) {
    if (!id) {
      throw new Error("Task ID là bắt buộc.");
    }

    return api.put(`/tasks/${id}`, data);
  },

  remove(id) {
    if (!id) {
      throw new Error("Task ID là bắt buộc.");
    }

    return api.delete(`/tasks/${id}`);
  },
};

export default taskApi;
