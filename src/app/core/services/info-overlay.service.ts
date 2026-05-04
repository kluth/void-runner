import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InfoOverlayService {
  visible = signal(false);
  title = signal('');
  content = signal('');

  open(title: string, content: string) {
    this.title.set(title);
    this.content.set(content);
    this.visible.set(true);
  }

  close() {
    this.visible.set(false);
  }
}