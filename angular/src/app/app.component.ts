// 루트 컴포넌트: 키 입력 폼과 플레이어 임베드/파일 업로드 섹션으로 데모 페이지를 구성한다.
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KollusPlayerComponent } from './components/kollus-player/kollus-player.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';

const DEFAULT_CUID = 'guest';

interface PlayerConfig {
  securityKey: string;
  customKey: string;
  cuid: string;
  mediaContentKey: string;
}

/**
 * Kollus 미디어 플랫폼 연동 샘플 (Angular): 플레이어 임베드 + 파일 업로드 데모.
 * 백엔드 없이 동작하며, JWT는 브라우저에서 폼 입력값으로 직접 서명한다.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, KollusPlayerComponent, FileUploaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  securityKey = '';
  customKey = '';
  cuid = DEFAULT_CUID;
  mediaContentKey = '';
  // 타이핑 중 매 글자마다 JWT 서명/플레이어 로드가 반복되지 않도록,
  // 버튼 클릭 시점의 입력값 스냅샷으로만 플레이어를 렌더링한다.
  appliedConfig: PlayerConfig | null = null;

  /**
   * 플레이어 로드에 필요한 네 가지 입력값이 모두 채워졌는지 여부 (버튼 활성화 조건).
   * @returns 모든 값이 입력되었으면 true
   */
  get canLoadPlayer(): boolean {
    return Boolean(this.securityKey && this.customKey && this.cuid && this.mediaContentKey);
  }

  /**
   * [플레이어 불러오기] 클릭 핸들러: 현재 입력값 스냅샷을 적용해 플레이어를 렌더링한다.
   */
  handleLoadPlayer(): void {
    this.appliedConfig = {
      securityKey: this.securityKey,
      customKey: this.customKey,
      cuid: this.cuid,
      mediaContentKey: this.mediaContentKey,
    };
  }
}
