import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface UploadUrlResponse {
  data: {
    upload_url: string;
    upload_file_key: string;
    progress_url: string;
  };
}

interface UploadProgressResponse {
  data?: {
    percent: number;
  };
  percent?: number;
}

// Kollus VOD REST API (KR region). 원래는 서버 사이드 호출용 API이지만,
// 브라우저에서 직접 호출해도 CORS로 차단되지 않는 것을 확인했다.
const VOD_API_BASE_URL = 'https://c-api-kr.kollus.com/api';

/**
 * Kollus VOD API(업로드 URL 발급, 업로드 진행률 조회)를 직접 호출하는 서비스.
 */
@Injectable({ providedIn: 'root' })
export class KollusApiService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Kollus VOD API를 직접 호출해 업로드 URL을 발급받는다.
   * API 접근 토큰(accessToken)은 인자로만 받아 저장하지 않는다.
   * @param fileName 업로드할 파일명(콘텐츠 제목으로 사용)
   * @param accessToken Kollus API 접근 토큰
   */
  async createUploadUrl(
    fileName: string,
    accessToken: string,
  ): Promise<{ uploadUrl: string; uploadFileKey: string; progressUrl: string }> {
    const body = new URLSearchParams({ title: fileName });
    const response = await firstValueFrom(
      this.http.post<UploadUrlResponse>(
        `${VOD_API_BASE_URL}/upload/create-url?access_token=${encodeURIComponent(accessToken)}`,
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );
    return {
      uploadUrl: response.data.upload_url,
      uploadFileKey: response.data.upload_file_key,
      progressUrl: response.data.progress_url,
    };
  }

  /**
   * 파일을 Kollus 업로드 서버에 직접 전송한다. 필드명은 반드시 'upload-file'.
   * XHR/HttpClient에 upload progress 리포팅을 붙이면 CORS preflight가 강제되어 Kollus 업로드
   * 서버가 거부하므로, preflight가 없는 단순 fetch POST로 전송하고 진행률은 progress_url 폴링으로 표시한다.
   * @param uploadUrl createUploadUrl로 발급받은 업로드 서버 URL
   * @param file 업로드할 파일
   */
  async uploadFile(uploadUrl: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('upload-file', file);

    const response = await fetch(uploadUrl, { method: 'POST', body: formData });

    if (!response.ok) {
      throw new Error(`업로드 실패 (status: ${response.status})`);
    }
  }

  /**
   * createUploadUrl 응답의 progress_url을 그대로 호출해 업로드 진행률을 조회한다.
   * Kollus 진행률 응답의 정확한 필드 스펙이 공개 문서에 없어 방어적으로 파싱한다.
   * @param progressUrl createUploadUrl로 발급받은 진행률 조회 URL
   */
  async fetchUploadProgress(progressUrl: string): Promise<number> {
    const response = await firstValueFrom(this.http.get<UploadProgressResponse>(progressUrl));
    return response.data?.percent ?? response.percent ?? 0;
  }
}
