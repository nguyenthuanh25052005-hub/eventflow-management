import api from "./axios";

const employeeApi = {
  getAll: () => {
    return api.get("/employees");
  },

  create: (data) => {
    return api.post("/employees", data);
  },

  update: (id, data) => {
    return api.put(`/employees/${id}`, data);
  },
};

export default employeeApi;
