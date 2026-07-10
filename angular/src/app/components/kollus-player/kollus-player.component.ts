import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { KollusApiService } from '../../services/kollus-api.service';

declare global {
  interface Window {
    VgControllerClient: new (options: { target_window: Window | null }) => {
      on: (eventName: string, callback: () => void) => void;
    };
  }
}

const VG_CONTROLLER_SCRIPT_URL =
  'https://file.kollus.com/vgcontroller/vg-controller-client.latest.min.js';
const PLAYER_GATEWAY_URL = 'https://v.kr.kollus.com/s';
// VgControllerClient가 노출하는 재생 라이프사이클 이벤트 목록
const PLAYER_EVENTS = ['loaded', 'ready', 'play', 'pause', 'done', 'waiting'];

let vgControllerScriptPromise: Promise<Window['VgControllerClient']> | null = null;

/**
 * VG Controller 스크립트를 1회만 로드하고 이후 호출은 같은 Promise를 재사용한다.
 */
function loadVgControllerScript(): Promise<Window['VgControllerClient']> {
  if (vgControllerScriptPromise) {
    return vgControllerScriptPromise;
  }

  vgControllerScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = VG_CONTROLLER_SCRIPT_URL;
    script.onload = () => resolve(window.VgControllerClient);
    script.onerror = () => reject(new Error('VG Controller 스크립트 로드 실패'));
    document.head.appendChild(script);
  });

  return vgControllerScriptPromise;
}

/**
 * Kollus 플레이어 임베드 컴포넌트.
 * 백엔드에서 JWT를 발급받아 S링크 URL을 구성해 iframe으로 재생하고,
 * VG Controller SDK를 통해 재생 상태 이벤트를 수신한다.
 */
@Component({
  selector: 'app-kollus-player',
  standalone: true,
  templateUrl: './kollus-player.component.html',
})
export class KollusPlayerComponent implements OnChanges {
  @Input({ required: true }) mediaContentKey!: string;
  @ViewChild('playerIframe') iframeRef?: ElementRef<HTMLIFrameElement>;

  playerUrl: SafeResourceUrl | null = null;
  error: string | null = null;
  playerStatus = 'idle';

  constructor(
    private readonly kollusApi: KollusApiService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaContentKey']) {
      this.loadPlayerUrl();
    }
  }

  private async loadPlayerUrl(): Promise<void> {
    this.playerUrl = null;
    this.error = null;

    try {
      // Kollus API: POST /jwt/create - 재생용 JWT + 사용자 키(custom_key) 발급
      const { jwt, customKey } = await this.kollusApi.fetchPlayerToken(this.mediaContentKey);
      // 신뢰 가능한 백엔드가 발급한 URL이므로 iframe 임베드를 위해 sanitizer 우회 처리
      this.playerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${PLAYER_GATEWAY_URL}?jwt=${jwt}&custom_key=${customKey}`,
      );
    } catch (err) {
      // JWT 발급 실패: 사용자에게 에러 상태 표시 후 재시도 유도
      console.error('[Kollus] 토큰 발급 실패:', (err as Error).message);
      this.error = '플레이어를 불러올 수 없습니다.';
    }
  }

  // iframe.src 설정 직후에는 contentWindow가 about:blank 상태라 load 이벤트 이후에 controller를 생성해야 함
  async onIframeLoad(): Promise<void> {
    if (!this.iframeRef) return;

    try {
      const VgControllerClient = await loadVgControllerScript();
      const controller = new VgControllerClient({
        target_window: this.iframeRef.nativeElement.contentWindow,
      });
      PLAYER_EVENTS.forEach((eventName) => {
        controller.on(eventName, () => {
          this.playerStatus = eventName;
        });
      });
    } catch (err) {
      // SDK 로드 실패: 이벤트 상태 표시만 불가하며 재생 자체는 iframe으로 계속 진행
      console.error('[Kollus] VG Controller 초기화 실패:', (err as Error).message);
    }
  }
}
