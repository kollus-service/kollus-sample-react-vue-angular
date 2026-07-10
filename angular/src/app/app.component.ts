import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KollusPlayerComponent } from './components/kollus-player/kollus-player.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';

/**
 * Kollus 미디어 플랫폼 연동 샘플 (Angular): 플레이어 임베드 + 파일 업로드 데모.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, KollusPlayerComponent, FileUploaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  mediaContentKey = '';
}
