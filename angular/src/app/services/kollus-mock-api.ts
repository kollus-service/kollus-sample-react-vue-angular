const MOCK_NETWORK_DELAY_MS = 400;
const MOCK_UPLOAD_STEP_MS = 200;
const MOCK_UPLOAD_STEP_PERCENT = 20;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockFetchPlayerToken(): Promise<{ jwt: string; customKey: string }> {
  await wait(MOCK_NETWORK_DELAY_MS);
  return { jwt: 'mock-jwt-token', customKey: 'mock-custom-key' };
}

export async function mockCreateUploadUrl(): Promise<{
  uploadUrl: string;
  uploadFileKey: string;
}> {
  await wait(MOCK_NETWORK_DELAY_MS);
  return { uploadUrl: 'mock://upload', uploadFileKey: 'mock-upload-file-key' };
}

// 데모 환경에서는 동시 업로드를 가정하지 않으므로 진행률을 단일 값으로 공유한다.
let mockUploadProgress = 0;

export function mockUploadFile(onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve) => {
    mockUploadProgress = 0;

    const intervalId = setInterval(() => {
      mockUploadProgress = Math.min(100, mockUploadProgress + MOCK_UPLOAD_STEP_PERCENT);
      onProgress(mockUploadProgress);

      if (mockUploadProgress >= 100) {
        clearInterval(intervalId);
        resolve();
      }
    }, MOCK_UPLOAD_STEP_MS);
  });
}

export async function mockFetchUploadProgress(): Promise<number> {
  await wait(MOCK_NETWORK_DELAY_MS / 2);
  return mockUploadProgress;
}
