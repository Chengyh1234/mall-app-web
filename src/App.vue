<script setup lang="ts">
// 未读消息数请求只由首页/个人中心页面触发（进入页面刷新并轮询、离开即停止），不在 App 全局发起
</script>

<style lang="scss">
// 字体图标
@use '@/styles/fonts.scss';

view,
navigator,
input,
scroll-view {
  box-sizing: border-box;
}

button::after {
  border: none;
}

swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}

// 一行省略
.clamp {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

// 两行省略
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
}

// 边框样式（底部边框）
.b-b:after,
.b-t:after {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  height: 0;
  content: '';
  transform: scaleY(0.5);
  border-bottom: 1px solid #e4e7ed;
}

.b-b:after {
  bottom: 0;
}

.b-t:after {
  top: 0;
}
</style>
