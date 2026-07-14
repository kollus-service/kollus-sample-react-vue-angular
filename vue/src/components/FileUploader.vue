<script setup>
// Kollus VOD API를 직접 호출해 업로드 URL을 발급받아 파일을 전송하고,
// 업로드 진행률을 폴링해 표시하는 컴포넌트. API 접근 토큰은 폼 입력값만 사용하고 저장하지 않는다.
import { ref } from 'vue'
import { createUploadUrl, fetchUploadProgress, uploadFile } from '../api/uploadApi'

const PROGRESS_POLL_INTERVAL_MS = 2000

const accessToken = ref('')
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

function startProgressPolling(progressUrl) {
  pollIntervalId = setInterval(async () => {
    try {
      const percent = await fetchUploadProgress(progressUrl)
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
  if (!selectedFile.value || !accessToken.value) return

  isUploading.value = true
  error.value = null
  progress.value = 0

  try {
    // Kollus API: POST /upload/create-url - 업로드 서버 URL + 진행률 조회 URL 발급
    const { uploadUrl, progressUrl } = await createUploadUrl(
      selectedFile.value.name,
      accessToken.value,
    )
    startProgressPolling(progressUrl)
    await uploadFile(uploadUrl, selectedFile.value)
    progress.value = 100
    isDone.value = true
  } catch (err) {
    // 업로드 실패: 사용자에게 에러 상태 표시 후 재시도 유도 (주로 잘못된 access_token)
    console.error('[Kollus] 파일 업로드 실패:', err.message)
    error.value = '파일 업로드에 실패했습니다. API 접근 토큰을 확인해 주세요.'
  } finally {
    stopProgressPolling()
    isUploading.value = false
  }
}
</script>

<template>
  <div>
    <p class="hint-text">
      API 접근 토큰은 브라우저 메모리에서만 사용되며 저장되지 않습니다(새로고침 시 사라짐).
    </p>
    <div class="field-group">
      <label>
        API 접근 토큰 (access_token)
        <input type="password" v-model="accessToken" autocomplete="off" :disabled="isUploading" />
      </label>
    </div>

    <input type="file" :disabled="isUploading" @change="handleFileChange" />
    <button
      type="button"
      :disabled="!selectedFile || !accessToken || isUploading"
      @click="handleUpload"
    >
      업로드
    </button>

    <div v-if="isUploading || isDone" class="progress-bar">
      <div :style="{ width: `${progress}%` }"></div>
    </div>
    <p v-if="isDone">업로드 완료 ({{ progress }}%)</p>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>
