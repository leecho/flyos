import { ref } from 'vue';

export interface NotificationOptions {
  title: string;
  content: string;
  appName?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

export interface NotificationItem extends NotificationOptions {
  id: number;
  time: string;
}

const notifications = ref<NotificationItem[]>([]);

export function useNotification() {
  /**
   * 发送一个新的通知
   */
  const push = (options: NotificationOptions) => {
    const id = Date.now();
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    const item: NotificationItem = {
      id,
      appName: options.appName || 'FlyOS 系统',
      title: options.title,
      content: options.content,
      type: options.type || 'info',
      duration: options.duration || 5000,
      time: timeString
    };

    notifications.value.unshift(item);

    if (item.duration !== 0) {
      setTimeout(() => {
        remove(id);
      }, item.duration);
    }
  };

  /**
   * 移除特定通知
   */
  const remove = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  /**
   * 清空所有通知
   */
  const clearAll = () => {
    notifications.value = [];
  };

  return {
    notifications,
    push,
    remove,
    clearAll
  };
}
