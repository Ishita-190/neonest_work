"use client";

import React, { useState } from "react";
import { Search, Filter, Trash2, Bell, ExternalLink } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const NotificationsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { 
    notifications, 
    loading, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    deleteAllNotifications,
    unreadCount 
  } = useNotifications();

  // Filter notifications based on search and filter criteria
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || 
                         (filterType === "unread" && !notification.isRead) ||
                         (filterType === "read" && notification.isRead) ||
                         notification.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleDeleteAllClick = () => {
    setShowDeleteAllModal(true);
  };

  const handleConfirmDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllNotifications();
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      feeding_reminder: "🍼",
      sleep_reminder: "😴",
      vaccine_reminder: "💉",
      milestone_celebration: "🎉",
      essentials_alert: "📦",
      weather_alert: "🌤️",
      appointment_reminder: "📅",
    };
    return icons[type] || "🔔";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-100 rounded-full">
                <Bell className="text-pink-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {notifications.length} total • {unreadCount} unread
                </p>
              </div>
            </div>

            {/* Search, Filter, and Delete All Controls */}
            <div className="flex gap-3 items-center">
              {/* Search Bar - Reduced width */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="feeding_reminder">Feeding</option>
                  <option value="sleep_reminder">Sleep</option>
                  <option value="vaccine_reminder">Vaccines</option>
                  <option value="milestone_celebration">Milestones</option>
                  <option value="essentials_alert">Essentials</option>
                  <option value="weather_alert">Weather</option>
                  <option value="appointment_reminder">Appointments</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-pink-600 hover:text-pink-700 font-medium whitespace-nowrap"
                >
                  Mark all read
                </button>
              )}

              {/* Delete All Button */}
              {notifications.length > 0 && (
                <div className="relative group">
                  <button
                    onClick={handleDeleteAllClick}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
                    title="Delete All Notifications"
                  >
                    <Trash2 size={20} />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                    Delete All Notifications
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {notifications.length === 0 ? "No notifications to display!" : "No matching notifications"}
                </h3>
                <p className="text-gray-600">
                  {notifications.length === 0 
                    ? "We'll notify you about important updates for your baby"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                      !notification.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-3xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`text-lg font-medium ${
                                !notification.isRead ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mt-1 text-base">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <p className="text-sm text-gray-400">
                                {formatTime(notification.scheduledFor)}
                              </p>
                              {!notification.isRead && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                              {notification.babyName && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                  {notification.babyName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="text-gray-400 hover:text-pink-600 p-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={18} />
                              </Link>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              className="text-gray-400 hover:text-red-600 p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAllModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteAllModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete All Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete all notifications? This will permanently remove all {notifications.length} notification{notifications.length !== 1 ? 's' : ''} from your account.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteAllModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteAll}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationsPage;
