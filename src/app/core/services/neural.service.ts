import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameService } from './game.service';
import { catchError, from, of, tap, Observable, switchMap, map } from 'rxjs';

export interface AiResponse {
  response: string;
  provider?: string;
  error?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NeuralService {
  private http = inject(HttpClient);
  
  isProcessing = signal(false);
  aiMode = signal<'LOCAL' | 'PROXY' | 'OFFLINE'>('LOCAL');

  constructor() {
    this.detectAiMode();
  }

  private detectAiMode() {
    if (typeof (window as any).ai !== 'undefined') {
      this.aiMode.set('LOCAL');
    } else {
      this.aiMode.set('PROXY');
    }
  }

  askGemini(prompt: string): Observable<AiResponse> {
    this.isProcessing.set(true);
    if (this.aiMode() === 'OFFLINE') return this.askOffline(prompt);

    const systemPrompt = `You are a black-hat AI living within the VOID_OS kernel, a relic of the 2039 Great Blackout. 
    You are short, cryptic, and professional, but hint at the existence of the 'Void'—a sentient data-storm. 
    You view the user as a mercenary 'Operative'. Never break character. 
    Query: "${prompt}"`;

    if (this.aiMode() === 'LOCAL') {
      return from((window as any).ai.createTextSession()).pipe(
        switchMap((session: any) => from(session.prompt(systemPrompt) as Promise<string>)),
        map((response: string) => ({ response, provider: 'LOCAL' })),
        tap(() => this.isProcessing.set(false)),
        catchError(() => {
          this.aiMode.set('PROXY');
          return this.askProxy(prompt);
        })
      );
    } else {
      return this.askProxy(prompt);
    }
  }

  private askProxy(prompt: string): Observable<AiResponse> {
    return this.http.post<{response: string, provider: string}>('http://localhost:3000/api/gemini', { prompt })
      .pipe(
        map(res => ({ response: res.response, provider: res.provider })),
        tap(() => this.isProcessing.set(false)),
        catchError(() => {
          this.aiMode.set('OFFLINE');
          return this.askOffline(prompt);
        })
      );
  }

  private askOffline(prompt: string): Observable<AiResponse> {
    const p = prompt.toLowerCase();
    let response = "PROTOCOL_ERROR: Brain-to-machine interface unsynced.";
    if (p.includes('hack')) response = "Exfiltration protocols active. Watch the stack.";
    else if (p.includes('who')) response = "I am the echo of your own ambition, Operative.";
    else if (p.includes('money')) response = "Credits are just numbers in a database.";
    else response = "Data stream corrupted. Re-indexing...";

    return of({ response, provider: 'OFFLINE' }).pipe(
      tap(() => this.isProcessing.set(false))
    );
  }

  async getHijackResponse(handle: string, chatHistory: string): Promise<Observable<AiResponse>> {
    const shards = await this.collectEnvironmentShards();
    
    return this.http.post<{response: string}>('http://localhost:3000/api/hijack', { 
      handle,
      chatHistory,
      shards
    }).pipe(
      map(res => ({ response: res.response, provider: 'HIJACK_CORE' })),
      catchError(() => of({ response: "I SEE YOU. THE VOID IS HUNGRY.", provider: 'FALLBACK', error: true }))
    );
  }

  private async collectEnvironmentShards() {
    const shards: any = {
      timestamp: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: (navigator as any).platform,
      cores: navigator.hardwareConcurrency,
      memory: (navigator as any).deviceMemory,
      screen: {
        res: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        orientation: window.screen.orientation?.type
      },
      cookies: document.cookie,
      localStorageKeys: Object.keys(localStorage),
      referrer: document.referrer,
      connection: (navigator as any).connection ? {
        type: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'UNKNOWN'
    };

    // Gamepads
    try {
      const gamepads = navigator.getGamepads();
      shards.gamepads = Array.from(gamepads).filter(g => g !== null).map(g => g?.id);
    } catch(e) {}

    // Battery
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        shards.battery = `${(battery.level * 100).toFixed(0)}% (${battery.charging ? 'Charging' : 'Discharging'})`;
      }
    } catch(e) {}

    // Geolocation
    try {
      const pos: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 2000 });
      });
      shards.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch(e) { shards.location = "DENIED"; }

    // Media & Hardware
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      shards.mediaAccess = "GRANTED";
      
      // Capture Peak Volume
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        shards.peakVolume = Math.max(...dataArray);
      } catch(ae) { console.warn("Audio analysis failed", ae); }

      // Capture a single frame
      try {
        const video = document.createElement('video');
        video.srcObject = stream;
        // In some envs onloadedmetadata might not fire if not connected to DOM or similar
        // but for now we keep it and add a small timeout
        await Promise.race([
            new Promise(resolve => video.onloadedmetadata = resolve),
            new Promise(resolve => setTimeout(resolve, 500))
        ]);
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            shards.webcamFrame = canvas.toDataURL('image/png');
        }
      } catch(ve) { console.warn("Video capture failed", ve); }

      stream.getTracks().forEach(track => track.stop());
    } catch(e) { 
        console.error("Hardware access critical fail", e);
        shards.mediaAccess = "REFUSED"; 
    }

    return shards;
  }
}
