<template>
  <div class="Content">
    <div class="container">
      <h1 class="Content__Title">
        {{ $t('home.title') }}
      </h1>
      <p>{{ $t('home.introduction') }}</p>
    </div>
    <div id="chatRoom" class="chatRoom">
      <span class="chatRoomMsg">您有@消息，<span>点击查看>></span></span>
      <span class="unreadMsgNum"></span>
    </div>
  </div>
</template>
  
<script>
export default {
  head() {
    return { title: this.$t('home.title') }
  },
  mounted() {
  },
  methods: {
    
  }
}
</script>
  