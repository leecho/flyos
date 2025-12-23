<template>
  <!-- 使用通用的 LiveTile 控制器，设置为垂直推移 -->
  <LiveTile :items="emails" :interval="4500" animationType="slide-up">
    <template #default="{ item }">
      <div class="w-full h-full p-3 flex flex-col justify-start text-left bg-white/5 hover:bg-white/10 transition-colors">
        <!-- 邮件头部：发件人和时间 -->
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-xs font-bold truncate pr-2">{{ item.from }}</span>
          <span class="text-[9px] opacity-60 flex-shrink-0">{{ item.time }}</span>
        </div>

        <!-- 邮件主题 -->
        <div class="text-xs font-medium text-blue-200 truncate mb-1">
          {{ item.subject }}
        </div>

        <!-- 邮件正文预览 -->
        <div class="text-[10px] opacity-70 line-clamp-3 leading-relaxed">
          {{ item.preview }}
        </div>

        <!-- 右下角邮件图标标识 -->
        <div class="absolute bottom-2 right-2 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><rect width="20" height="16" x="2" y="4" rx="2"></rect></svg>
        </div>
      </div>
    </template>

    <!-- 底部重叠层：未读计数提示 -->
    <template #overlay="{ total }">
      <div class="absolute bottom-2 left-3 z-20 pointer-events-none">
        <div class="flex items-center space-x-1">
          <span class="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-sm">
            {{ total }} 封未读邮件
          </span>
        </div>
      </div>
    </template>
  </LiveTile>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LiveTile from '../components/LiveTile.vue'; // 确保指向 Canvas 中的组件路径

interface EmailItem {
  from: string;
  subject: string;
  preview: string;
  time: string;
}

// 模拟邮件数据
const emails = ref<EmailItem[]>([
  {
    from: 'GitHub',
    subject: '[FlyOS] 收到一个新的 Pull Request',
    preview: '用户 fly-admin 提交了关于“磁贴动画优化”的代码更改，请及时审核并处理。',
    time: '10:24'
  },
  {
    from: 'Microsoft Azure',
    subject: '您的服务账单已就绪',
    preview: '您 12 月份的 Azure 消费账单已生成。本月总计消费 $0.00，请登录门户查看详细信息。',
    time: '昨天'
  },
  {
    from: 'Vue.js News',
    subject: 'Vue 3.5 版本特性预告',
    preview: '探索即将到来的新特性：更加轻量的响应式系统、全新的内置组件以及性能的大幅提升。',
    time: '12-22'
  }
]);
</script>

<style scoped>
/* 磁贴内部微调 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
