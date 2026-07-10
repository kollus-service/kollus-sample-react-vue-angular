import { Component } from '@angular/core';
import { KollusApiService } from '../../services/kollus-api.service';

const PROGRESS_POLL_INTERVAL_MS = 2000;

/**
 * Kollus 업로드 URL을 발급받아 파일을 직접 전송하고,
 * 백엔드 프록시로 업로드 진행률을 폴링해 표시하는 컴포넌트.
 */
@Component({
  selector: 'app-file-uploader',
  standalone: true,
  templateUrl: './file-uploader.component.html',
})
export class FileUploaderComponent {
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

  private startProgressPolling(uploadFileKey: string): void {
    this.pollIntervalId = setInterval(async () => {
      try {
        // Kollus 업로드 진행률 조회: 백엔드 프록시가 Kollus progress_url을 대신 호출
        const percent = await this.kollusApi.fetchUploadProgress(uploadFileKey);
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
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.error = null;
    this.progress = 0;

    try {
      const { uploadUrl, uploadFileKey } = await this.kollusApi.createUploadUrl(
        this.selectedFile.name,
      );
      this.startProgressPolling(uploadFileKey);
      await this.kollusApi.uploadFile(uploadUrl, this.selectedFile, (percent) => {
        this.progress = percent;
      });
      this.isDone = true;
    } catch (err) {
      // 업로드 실패: 사용자에게 에러 상태 표시 후 재시도 유도
      console.error('[Kollus] 파일 업로드 실패:', (err as Error).message);
      this.error = '파일 업로드에 실패했습니다.';
    } finally {
      this.stopProgressPolling();
      this.isUploading = false;
    }
  }
}
