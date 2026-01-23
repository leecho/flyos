import { ref } from 'vue';

export interface NotificationOptions {
  title: string;
  content: string;
  appName?: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
  handler?: () => void
}

export interface NotificationItem extends NotificationOptions {
  id: number;
  time: string;
  isToast: boolean; // 是否正在桌面上弹出显示
}

// 这是一个全局响应式引用，确保所有引用该 hook 的地方数据同步
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
      duration: options.duration ?? 5000,
      handler: options.handler,
      time: timeString,
      isToast: true // 初始状态在桌面上弹出
    };

    notifications.value.unshift(item);

    // 如果设置了自动隐藏弹出窗（duration 不为 0）
    if (item.duration !== 0) {
      setTimeout(() => {
        hideToast(id);
      }, item.duration);
    }
  };

  /**
   * 仅从悬浮提醒中隐藏，但不从通知中心删除
   */
  const hideToast = (id: number) => {
    const item = notifications.value.find(n => n.id === id);
    if (item) {
      item.isToast = false;
    }
  };

  /**
   * 彻底移除通知（例如用户在通知中心点击了删除）
   */
  const remove = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  };

  /**
   * 清空所有通知数据
   */
  const clearAll = () => {
    notifications.value = [];
  };


  return {
    notifications,
    push,
    hideToast,
    remove,
    clearAll
  };
}
