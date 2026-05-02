import { Injectable, signal, inject } from '@angular/core';
import { NeuralService } from './neural.service';

@Injectable({
  providedIn: 'root'
})
export class ScribeService {
  private neural = inject(NeuralService);
  scribeLogs = signal<{timestamp: number, text: string}[]>([]);

  documentEvent(type: string, data: any) {
    const prompt = `You are a neural-scribe documenting the actions of a rogue operative. 
    Summarize this event into a short, stylized, noir-cyberpunk narrative snippet (max 15 words):
    Event Type: ${type}
    Data: ${JSON.stringify(data)}`;

    this.neural.askGemini(prompt).subscribe(res => {
      if (res.response) {
        this.scribeLogs.update(logs => [{
          timestamp: Date.now(),
          text: res.response.trim()
        }, ...logs].slice(0, 20));
      }
    });
  }
}
