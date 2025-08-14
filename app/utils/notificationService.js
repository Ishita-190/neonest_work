import { toast } from "sonner";

class NotificationService {
  constructor() {
    this.baseURL = "/api/notifications";
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // Get all notifications
  async getNotifications(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : "";
    
    return await this.apiCall(endpoint);
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    return await this.apiCall(`/${notificationId}/read`, {
      method: "PUT",
    });
  }

  // Mark all notifications as read
  async markAllAsRead() {
    return await this.apiCall("/mark-all-read", {
      method: "PUT",
    });
  }

  // Delete single notification
  async deleteNotification(notificationId) {
    return await this.apiCall(`/${notificationId}`, {
      method: "DELETE",
    });
  }

  // Delete all notifications
  async deleteAllNotifications() {
    return await this.apiCall("/delete-all", {
      method: "DELETE",
    });
  }

  // Create feeding reminder
  async createFeedingReminder(scheduledFor, babyName, feedingType = "breast") {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "feeding_reminder",
        title: "Feeding Time!",
        message: `Time to feed ${babyName} (${feedingType})`,
        scheduledFor,
        babyName,
        data: { feedingType },
      }),
    });
  }

  // Create sleep reminder
  async createSleepReminder(scheduledFor, babyName) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "sleep_reminder",
        title: "Bedtime Reminder",
        message: `It's time for ${babyName}'s sleep`,
        scheduledFor,
        babyName,
      }),
    });
  }

  // Create vaccine reminder
  async createVaccineReminder(vaccineName, scheduledFor, babyName) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "vaccine_reminder",
        title: "Vaccine Reminder",
        message: `${babyName} is due for ${vaccineName}`,
        scheduledFor,
        babyName,
        data: { vaccineName },
      }),
    });
  }

  // Create milestone celebration
  async createMilestoneCelebration(milestoneName, babyName) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "milestone_celebration",
        title: "Milestone Achievement! 🎉",
        message: `${babyName} has reached a new milestone: ${milestoneName}`,
        scheduledFor: new Date(),
        babyName,
        data: { milestoneName },
      }),
    });
  }

  // Create essentials alert
  async createEssentialsAlert(itemName, babyName) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "essentials_alert",
        title: "Low Stock Alert",
        message: `Running low on ${itemName} for ${babyName}`,
        scheduledFor: new Date(),
        babyName,
        data: { itemName },
      }),
    });
  }

  // Create weather reminder
  async createWeatherReminder(weatherData, babyName) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "weather_alert",
        title: "Weather Update",
        message: weatherData.message || "Check the weather for outdoor activities",
        scheduledFor: new Date(),
        babyName,
        data: weatherData,
      }),
    });
  }

  // Create appointment reminder
  async createAppointmentReminder(appointmentType, scheduledFor, babyName) {
    return await this.apiCall("", {
      method: "POST",
      body: JSON.stringify({
        type: "appointment_reminder",
        title: "Appointment Reminder",
        message: `${babyName} has a ${appointmentType} appointment scheduled`,
        scheduledFor,
        babyName,
        data: { appointmentType },
      }),
    });
  }

  // Show toast notification
  showToast(message, type = "success") {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "loading":
        toast.info(message);
        break;
      default:
        toast(message);
    }
  }
}

export const notificationService = new NotificationService();
