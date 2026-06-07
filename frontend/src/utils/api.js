import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// Lead API calls
export const leadsAPI = {
  getAll: (params) => api.get("/leads", { params }),
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post("/leads", data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
  delete: (id) => api.delete(`/leads/${id}`),
  getStats: () => api.get("/leads/stats"),
};

export default api;
