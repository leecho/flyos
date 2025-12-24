import { reactive } from 'vue';

export type MessageType = 'alert' | 'confirm' | 'prompt';

interface MessageOption {
  title?: string;
  message: string;
  defaultValue?: string;
  type?: MessageType;
}

interface MessageState extends MessageOption {
  isOpen: boolean;
  resolve: (value: any) => void;
  reject: () => void;
  inputValue: string;
}

const state = reactive<MessageState>({
  isOpen: false,
  title: '系统提示',
  message: '',
  type: 'alert',
  defaultValue: '',
  inputValue: '',
  resolve: () => {},
  reject: () => {},
});

export const messageBox = {
  state,

  /**
   * 核心显示逻辑，返回 Promise 以支持 await 调用
   */
  show(options: MessageOption): Promise<any> {
    return new Promise((resolve, reject) => {
      state.title = options.title || '系统提示';
      state.message = options.message;
      state.type = options.type || 'alert';
      state.defaultValue = options.defaultValue || '';
      state.inputValue = state.defaultValue;
      state.isOpen = true;
      state.resolve = resolve;
      state.reject = reject;
    });
  },

  // 快捷方法
  alert(message: string, title?: string) {
    return this.show({ message, title, type: 'alert' });
  },

  confirm(message: string, title?: string) {
    return this.show({ message, title, type: 'confirm' });
  },

  prompt(message: string, defaultValue?: string, title?: string) {
    return this.show({ message, title, defaultValue, type: 'prompt' });
  },

  handleConfirm() {
    const result = state.type === 'prompt' ? state.inputValue : true;
    state.isOpen = false;
    state.resolve(result);
  },

  handleCancel() {
    state.isOpen = false;
    state.resolve(false); // Confirm 返回 false
  }
};

// 挂载到全局 window 方便调试和跨组件调用
if (typeof window !== 'undefined') {
  (window as any).$message = messageBox;
}
