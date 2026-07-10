import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  mockCreateUploadUrl,
  mockFetchPlayerToken,
  mockFetchUploadProgress,
  mockUploadFile,
} from './kollus-mock-api';

interface PlayerTokenResponse {
  jwt: string;
  custom_key: string;
}

interface UploadUrlResponse {
  data: {
    upload_url: string;
    upload_file_key: string;
  };
}

interface UploadProgressResponse {
  data: {
    percent: number;
  };
}

/**
 * Kollus 백엔드 프록시(JWT 발급, 업로드 URL 발급, 업로드 진행률 조회)를 호출하는 서비스.
 */
@Injectable({ providedIn: 'root' })
export class KollusApiService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Kollus 플레이어 재생용 JWT를 백엔드에서 발급받는다.
   * @param mediaContentKey 재생할 콘텐츠의 미디어 콘텐츠 키(mckey)
   */
  async fetchPlayerToken(mediaContentKey: string): Promise<{ jwt: string; customKey: string }> {
    if (environment.useMockApi) {
      return mockFetchPlayerToken();
    }

    const response = await firstValueFrom(
      this.http.post<PlayerTokenResponse>(`${environment.apiBaseUrl}/jwt/create`, {
        media_content_key: mediaContentKey,
      }),
    );
    return { jwt: response.jwt, customKey: response.custom_key };
  }

  /**
   * 백엔드 프록시를 통해 Kollus 업로드 URL을 발급받는다.
   * @param fileName 업로드할 파일명
   */
  async createUploadUrl(fileName: string): Promise<{ uploadUrl: string; uploadFileKey: string }> {
    if (environment.useMockApi) {
      return mockCreateUploadUrl();
    }

    const response = await firstValueFrom(
      this.http.post<UploadUrlResponse>(`${environment.apiBaseUrl}/api/upload/create-url`, {
        file_name: fileName,
      }),
    );
    return { uploadUrl: response.data.upload_url, uploadFileKey: response.data.upload_file_key };
  }

  /**
   * 파일을 Kollus 업로드 서버에 XHR로 직접 전송한다. 필드명은 반드시 'upload-file'.
   * @param uploadUrl createUploadUrl로 발급받은 업로드 서버 URL
   * @param file 업로드할 파일
   * @param onProgress 업로드 진행률 콜백 (0~100)
   */
  uploadFile(uploadUrl: string, file: File, onProgress: (percent: number) => void): Promise<void> {
    if (environment.useMockApi) {
      return mockUploadFile(onProgress);
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('upload-file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`업로드 실패 (status: ${xhr.status})`));
        }
      });
      xhr.addEventListener('error', () => reject(new Error('업로드 중 네트워크 오류가 발생했습니다.')));

      xhr.send(formData);
    });
  }

  /**
   * 백엔드 프록시를 통해 업로드 진행률을 조회한다.
   * @param uploadFileKey createUploadUrl로 발급받은 업로드 파일 키
   */
  async fetchUploadProgress(uploadFileKey: string): Promise<number> {
    if (environment.useMockApi) {
      return mockFetchUploadProgress();
    }

    const response = await firstValueFrom(
      this.http.get<UploadProgressResponse>(
        `${environment.apiBaseUrl}/api/upload/progress/${uploadFileKey}`,
      ),
    );
    return response.data.percent;
  }
}
