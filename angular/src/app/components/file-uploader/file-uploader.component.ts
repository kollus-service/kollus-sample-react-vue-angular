import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KollusApiService } from '../../services/kollus-api.service';

const PROGRESS_POLL_INTERVAL_MS = 2000;

/**
 * Kollus VOD API를 직접 호출해 업로드 URL을 발급받아 파일을 직접 전송하고,
 * 업로드 진행률을 폴링해 표시하는 컴포넌트.
 * API 접근 토큰은 폼 입력값만 컴포넌트 상태로 유지하며 저장하지 않는다.
 */
@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './file-uploader.component.html',
})
export class FileUploaderComponent {
  accessToken = '';
  selectedFile: File | null = null;
  isUploading = false;
  progress = 0;
  error: string | null = null;
  isDone = false;

  private pollIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly kollusApi: KollusApiService) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.isDone = false;
    this.error = null;
  }

  private startProgressPolling(progressUrl: string): void {
    this.pollIntervalId = setInterval(async () => {
      try {
        const percent = await this.kollusApi.fetchUploadProgress(progressUrl);
        this.progress = Math.max(this.progress, percent);
      } catch (err) {
        // 진행률 조회 실패는 업로드 자체를 막지 않으므로 로그만 남김
        console.error('[Kollus] 업로드 진행률 조회 실패:', (err as Error).message);
      }
    }, PROGRESS_POLL_INTERVAL_MS);
  }

  private stopProgressPolling(): void {
    if (this.pollIntervalId !== null) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  async onUpload(): Promise<void> {
    if (!this.selectedFile || !this.accessToken) return;

    this.isUploading = true;
    this.error = null;
    this.progress = 0;

    try {
      // Kollus API: POST /upload/create-url - 업로드 서버 URL + 진행률 조회 URL 발급
      const { uploadUrl, progressUrl } = await this.kollusApi.createUploadUrl(
        this.selectedFile.name,
        this.accessToken,
      );
      this.startProgressPolling(progressUrl);
      await this.kollusApi.uploadFile(uploadUrl, this.selectedFile);
      this.progress = 100;
      this.isDone = true;
    } catch (err) {
      // 업로드 실패: 사용자에게 에러 상태 표시 후 재시도 유도 (주로 잘못된 access_token)
      console.error('[Kollus] 파일 업로드 실패:', (err as Error).message);
      this.error = '파일 업로드에 실패했습니다. API 접근 토큰을 확인해 주세요.';
    } finally {
      this.stopProgressPolling();
      this.isUploading = false;
    }
  }
}
