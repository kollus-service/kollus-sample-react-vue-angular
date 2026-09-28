<script setup>
// Kollus 미디어 플랫폼 연동 샘플 (Vue): 플레이어 임베드 + 파일 업로드 데모.
// 백엔드 없이 동작하며, JWT는 브라우저에서 폼 입력값으로 직접 서명한다.
import { computed, ref } from 'vue'
import KollusPlayer from './components/KollusPlayer.vue'
import FileUploader from './components/FileUploader.vue'

const DEFAULT_CUID = 'guest'

const secretKey = ref('')
const customKey = ref('')
const cuid = ref(DEFAULT_CUID)
const mediaContentKey = ref('')
// 타이핑 중 매 글자마다 JWT 서명/플레이어 로드가 반복되지 않도록,
// 버튼 클릭 시점의 입력값 스냅샷으로만 플레이어를 렌더링한다.
const appliedConfig = ref(null)

const canLoadPlayer = computed(() =>
  Boolean(secretKey.value && customKey.value && cuid.value && mediaContentKey.value),
)

function handleLoadPlayer() {
  appliedConfig.value = {
    secretKey: secretKey.value,
    customKey: customKey.value,
    cuid: cuid.value,
    mediaContentKey: mediaContentKey.value,
  }
}
</script>

<template>
  <section>
    <h1>Kollus Sample (Vue)</h1>
  </section>

  <section>
    <h2>플레이어 임베드</h2>
    <p class="hint-text">
      아래 값은 브라우저 메모리에서만 사용되며 저장되지 않습니다(새로고침 시 사라짐).
    </p>
    <div class="field-group">
      <label>
        보안 키 (Secret Key)
        <input type="password" v-model="secretKey" autocomplete="off" />
      </label>
      <label>
        사용자 키 (custom_key)
        <input type="text" v-model="customKey" autocomplete="off" />
      </label>
      <label>
        시청자 ID (cuid)
        <input type="text" v-model="cuid" autocomplete="off" />
      </label>
      <label>
        미디어 콘텐츠 키 (mckey)
        <input type="text" v-model="mediaContentKey" autocomplete="off" />
      </label>
    </div>
    <button type="button" :disabled="!canLoadPlayer" @click="handleLoadPlayer">
      플레이어 불러오기
    </button>
    <KollusPlayer
      v-if="appliedConfig"
      :secret-key="appliedConfig.secretKey"
      :custom-key="appliedConfig.customKey"
      :cuid="appliedConfig.cuid"
      :media-content-key="appliedConfig.mediaContentKey"
    />
    <p v-else>모든 값을 입력한 뒤 [플레이어 불러오기]를 클릭하면 플레이어가 표시됩니다.</p>
  </section>

  <section>
    <h2>파일 업로드</h2>
    <FileUploader />
  </section>
</template>
