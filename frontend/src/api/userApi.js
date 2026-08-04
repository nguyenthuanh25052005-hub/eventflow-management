import api from "./axios";

const userApi = {
  getAll: () => {
    return api.get("/users");
  },

  getById: (id) => {
    return api.get(`/users/${id}`);
  },

  create: (data) => {
    return api.post("/users", data);
  },

  update: (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  updateStatus: (id, status) => {
    return api.put(`/users/${id}/status`, {
      status,
    });
  },
};

export default userApi;
