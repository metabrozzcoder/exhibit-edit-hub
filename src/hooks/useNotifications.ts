import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

const STORAGE_KEY = 'museum_notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error('Failed to parse stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep only last 100

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.description,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    });

    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Helper methods for common notification types
  const notifySuccess = useCallback((title: string, description: string, action?: Notification['action']) => {
    return addNotification({ title, description, type: 'success', action });
  }, [addNotification]);

  const notifyError = useCallback((title: string, description: string, action?: Notification['action']) => {
    return addNotification({ title, description, type: 'error', action });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, description: string, action?: Notification['action']) => {
    return addNotification({ title, description, type: 'warning', action });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, description: string, action?: Notification['action']) => {
    return addNotification({ title, description, type: 'info', action });
  }, [addNotification]);

  // Specific notification helpers
  const notifyReportCreated = useCallback((reportTitle: string, reportId: string) => {
    return notifySuccess(
      'Report Created',
      `Report "${reportTitle}" has been created successfully.`,
      {
        label: 'View Report',
        handler: () => {
          window.location.href = `/reports#${reportId}`;
        }
      }
    );
  }, [notifySuccess]);

  const notifyReportCompleted = useCallback((reportTitle: string, reportId: string) => {
    return notifyInfo(
      'Report Completed',
      `Report "${reportTitle}" has been completed and is ready for review.`,
      {
        label: 'View Report',
        handler: () => {
          window.location.href = `/reports#${reportId}`;
        }
      }
    );
  }, [notifyInfo]);

  const notifyUserCreated = useCallback((userName: string, userEmail: string) => {
    return notifySuccess(
      'User Created',
      `New user "${userName}" (${userEmail}) has been added to the system.`
    );
  }, [notifySuccess]);

  const notifyArtifactAdded = useCallback((artifactTitle: string, accessionNumber: string) => {
    return notifySuccess(
      'Artifact Added',
      `"${artifactTitle}" (${accessionNumber}) has been added to the collection.`,
      {
        label: 'View Artifact',
        handler: () => {
          window.location.href = `/artifacts`;
        }
      }
    );
  }, [notifySuccess]);

  const notifyArtifactUpdated = useCallback((artifactTitle: string, accessionNumber: string) => {
    return notifyInfo(
      'Artifact Updated',
      `"${artifactTitle}" (${accessionNumber}) has been updated.`
    );
  }, [notifyInfo]);

  const notifyArtifactDeleted = useCallback((artifactTitle: string, accessionNumber: string) => {
    return notifyWarning(
      'Artifact Deleted',
      `"${artifactTitle}" (${accessionNumber}) has been removed from the collection.`
    );
  }, [notifyWarning]);

  const notifySystemBackup = useCallback(() => {
    return notifyInfo(
      'System Backup',
      'Automated system backup has been completed successfully.'
    );
  }, [notifyInfo]);

  const notifyMaintenanceMode = useCallback((startTime: string) => {
    return notifyWarning(
      'Maintenance Scheduled',
      `System maintenance is scheduled to begin at ${startTime}. Some features may be temporarily unavailable.`
    );
  }, [notifyWarning]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    // Helper methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    // Specific helpers
    notifyReportCreated,
    notifyReportCompleted,
    notifyUserCreated,
    notifyArtifactAdded,
    notifyArtifactUpdated,
    notifyArtifactDeleted,
    notifySystemBackup,
    notifyMaintenanceMode,
  };
};