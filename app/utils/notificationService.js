import { toast } from "sonner";

export class NotificationService {
  constructor() {
    this.baseURL = "/api/notifications";
  }

  // Get auth token 
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  // Generic API call method with token support
  async apiCall(endpoint, options = {}) {
    try {
      const token = this.getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error: ${response.status}`, errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // Create a notification
  async createNotification(notificationData) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify(notificationData),
    });
  }

  // Get all notifications
  async getNotifications(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    const endpoint = queryParams.toString() ? `?${queryParams}` : "";
    return await this.apiCall(endpoint);
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    return await this.apiCall(`/${notificationId}/read`, { method: "PUT" });
  }

  // Mark all notifications as read
  async markAllAsRead() {
    return await this.apiCall("/mark-all-read", { method: "PUT" });
  }

  // Delete single notification
  async deleteNotification(notificationId) {
    return await this.apiCall(`/${notificationId}`, { method: "DELETE" });
  }

  // Delete all notifications
  async deleteAllNotifications() {
    return await this.apiCall("/delete-all", { method: "DELETE" });
  }

  // Reminder creators (all use apiCall)
  async createFeedingReminder(scheduledFor, babyName, feedingType = "breast") {
    return await this.createNotification({
      type: "feeding_reminder",
      title: "Feeding Time!",
      message: `Time to feed ${babyName} (${feedingType})`,
      scheduledFor: scheduledFor || new Date().toISOString(),
      babyName,
      data: { feedingType },
    });
  }

  async createSleepReminder(scheduledFor, babyName) {
    return await this.createNotification({
      type: "sleep_reminder",
      title: "Bedtime Reminder",
      message: `It's time for ${babyName}'s sleep`,
      scheduledFor: scheduledFor || new Date().toISOString(),
      babyName,
    });
  }

  async createVaccineReminder(vaccineName, scheduledFor, babyName) {
    return await this.createNotification({
      type: "vaccine_reminder",
      title: "Vaccine Reminder",
      message: `${babyName} is due for ${vaccineName}`,
      scheduledFor: scheduledFor || new Date().toISOString(),
      babyName,
      data: { vaccineName },
    });
  }

  async createMilestoneCelebration(milestoneName, babyName) {
    return await this.createNotification({
      type: "milestone_celebration",
      title: "Milestone Achievement! 🎉",
      message: `${babyName} has reached a new milestone: ${milestoneName}`,
      scheduledFor: new Date().toISOString(),
      babyName,
      data: { milestoneName },
    });
  }

  async createEssentialsAlert(itemName, babyName) {
    return await this.createNotification({
      type: "essentials_alert",
      title: "Low Stock Alert",
      message: `Running low on ${itemName} for ${babyName}`,
      scheduledFor: new Date().toISOString(),
      babyName,
      data: { itemName },
    });
  }

  async createWeatherReminder(weatherData, babyName) {
    return await this.createNotification({
      type: "weather_alert",
      title: "Weather Update",
      message:
        weatherData.message || "Check the weather for outdoor activities",
      scheduledFor: new Date().toISOString(),
      babyName,
      data: weatherData,
    });
  }

  async createAppointmentReminder(appointmentType, scheduledFor, babyName) {
    return await this.createNotification({
      type: "appointment_reminder",
      title: "Appointment Reminder",
      message: `${babyName} has a ${appointmentType} appointment scheduled`,
      scheduledFor: scheduledFor || new Date().toISOString(),
      babyName,
      data: { appointmentType },
    });
  }

  // Toast notification helper
  showToast(message, type = "success") {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "loading":
        toast.loading ? toast.loading(message) : toast.info(message);
        break;
      default:
        toast(message);
    }
  }
}

export const notificationService = new NotificationService();
