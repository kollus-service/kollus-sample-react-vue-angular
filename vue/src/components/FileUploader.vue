<script setup>
import { ref } from 'vue'
import { createUploadUrl, fetchUploadProgress, uploadFile } from '../api/uploadApi'

const PROGRESS_POLL_INTERVAL_MS = 2000

const selectedFile = ref(null)
const isUploading = ref(false)
const progress = ref(0)
const error = ref(null)
const isDone = ref(false)
let pollIntervalId = null

function handleFileChange(event) {
  selectedFile.value = event.target.files[0] ?? null
  isDone.value = false
  error.value = null
}

function startProgressPolling(uploadFileKey) {
  pollIntervalId = setInterval(async () => {
    try {
      // Kollus 업로드 진행률 조회: 백엔드 프록시가 Kollus progress_url을 대신 호출
      const percent = await fetchUploadProgress(uploadFileKey)
      progress.value = Math.max(progress.value, percent)
    } catch (err) {
      // 진행률 조회 실패는 업로드 자체를 막지 않으므로 로그만 남김
      console.error('[Kollus] 업로드 진행률 조회 실패:', err.message)
    }
  }, PROGRESS_POLL_INTERVAL_MS)
}

function stopProgressPolling() {
  clearInterval(pollIntervalId)
  pollIntervalId = null
}

async function handleUpload() {
  if (!selectedFile.value) return

  isUploading.value = true
  error.value = null
  progress.value = 0

  try {
    const { uploadUrl, uploadFileKey } = await createUploadUrl(selectedFile.value.name)
    startProgressPolling(uploadFileKey)
    await uploadFile(uploadUrl, selectedFile.value, (percent) => {
      progress.value = percent
    })
    isDone.value = true
  } catch (err) {
    // 업로드 실패: 사용자에게 에러 상태 표시 후 재시도 유도
    console.error('[Kollus] 파일 업로드 실패:', err.message)
    error.value = '파일 업로드에 실패했습니다.'
  } finally {
    stopProgressPolling()
    isUploading.value = false
  }
}
</script>

<template>
  <div>
    <input type="file" :disabled="isUploading" @change="handleFileChange" />
    <button type="button" :disabled="!selectedFile || isUploading" @click="handleUpload">
      업로드
    </button>

    <div v-if="isUploading || isDone" class="progress-bar">
      <div :style="{ width: `${progress}%` }"></div>
    </div>
    <p v-if="isDone">업로드 완료 ({{ progress }}%)</p>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>
