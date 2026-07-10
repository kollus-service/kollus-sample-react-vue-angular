<script setup>
import { ref } from 'vue'
import KollusPlayer from './components/KollusPlayer.vue'
import FileUploader from './components/FileUploader.vue'

const mediaContentKey = ref('')
</script>

<template>
  <section>
    <h1>Kollus Sample (Vue)</h1>
  </section>

  <section>
    <h2>플레이어 임베드</h2>
    <input v-model="mediaContentKey" type="text" placeholder="미디어 콘텐츠 키(mckey) 입력" />
    <KollusPlayer v-if="mediaContentKey" :media-content-key="mediaContentKey" />
    <p v-else>미디어 콘텐츠 키를 입력하면 플레이어가 표시됩니다.</p>
  </section>

  <section>
    <h2>파일 업로드</h2>
    <FileUploader />
  </section>
</template>
