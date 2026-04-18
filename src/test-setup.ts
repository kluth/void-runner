import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { vi } from 'vitest';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Global Mocks
class MockAudioContext {
  state = 'suspended';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  resume = vi.fn();
  createOscillator = vi.fn().mockReturnValue({
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  });
  createGain = vi.fn().mockReturnValue({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn()
  });
  createBiquadFilter = vi.fn().mockReturnValue({
    frequency: { setValueAtTime: vi.fn() },
    Q: { setValueAtTime: vi.fn() },
    connect: vi.fn()
  });
  createAnalyser = vi.fn().mockReturnValue({
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn()
  });
  createMediaStreamSource = vi.fn().mockReturnValue({
    connect: vi.fn()
  });
  createBuffer = vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(100))
  });
  createBufferSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn()
  });
}

(window as any).AudioContext = MockAudioContext;
(window as any).webkitAudioContext = MockAudioContext;

// Mock Notification
class MockNotification {
    static permission = 'granted';
    static requestPermission = vi.fn().mockResolvedValue('granted');
    constructor(public title: string, public options?: any) {}
}
(window as any).Notification = MockNotification;

// Mock Speech API
(window as any).SpeechSynthesisUtterance = class {
    text: string;
    voice: any = null;
    pitch: number = 1;
    rate: number = 1;
    volume: number = 1;
    constructor(text: string) { this.text = text; }
};

(window as any).speechSynthesis = {
    cancel: vi.fn(),
    speak: vi.fn(),
    getVoices: vi.fn().mockReturnValue([{ name: 'voice' }])
};

// Mock geolocation
(navigator as any).geolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) => success({
        coords: { latitude: 0, longitude: 0, accuracy: 10 }
    }))
};

// Mock mediaDevices
(navigator as any).mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }]
    })
};

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.load = vi.fn();

// Mock Canvas getContext
(window.HTMLCanvasElement.prototype as any).getContext = vi.fn().mockReturnValue({
    drawImage: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    setTransform: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn()
});
(window.HTMLCanvasElement.prototype as any).toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mocked');
