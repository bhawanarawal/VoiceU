import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device"


const api = axios.create({
  baseURL: Device.isDevice 
  ?"http://192.168.1.5:8000"
  :"http://10.0.2.2:8000", 
  timeout: 10000,
});


api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default api;
