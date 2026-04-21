import { Injectable, inject, signal } from '@angular/core';

export interface DetectedFace {
  boundingBox: { x: number; y: number; width: number; height: number };
  landmarks: { x: number; y: number; name?: string }[];
  confidence: number;
  expressions: { [key: string]: number };
  dominantExpression: string;
  ageEstimate: number | null;
  faceBrightness: number;
  faceColor: { r: number; g: number; b: number };
  accessories: string[];
}

export interface DetectedObject {
  class: string;
  score: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface ImageAnalysis {
  timestamp: number;
  frameDataUrl: string;
  dominantColors: { r: number; g: number; b: number; hex: string; percentage: number }[];
  brightness: number;
  overallMood: string;
  faces: DetectedFace[];
  objects: DetectedObject[];
  sceneDescription: string;
  observations: string[];
  clothingColors: { dominant: string; description: string }[];
}

export interface Observation {
  timestamp: number;
  description: string;
  confidence: number;
  category: 'face' | 'object' | 'mood' | 'environment' | 'clothing' | 'accessory' | 'action';
  frameRef: string;
}

@Injectable({ providedIn: 'root' })
export class VisionAnalysisService {
  // State
  isAnalyzing = signal(false);
  modelsLoaded = signal(false);
  faceCount = signal(0);
  lastAnalysis = signal<ImageAnalysis | null>(null);
  observations = signal<Observation[]>([]);
  lastErrorMessage = signal('');

  // Video/canvas elements
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;

  // Models
  private cocoSsdModel: any = null;
  private faceDetectionModel: any = null;
  private faceLandmarksModel: any = null;
  private mobileNetModel: any = null;

  // TF.js loaded flag
  private tfLoaded = false;

  // Analysis interval
  private analysisInterval: any = null;

  // Object label mapping for more descriptive names
  private objectDescriptions: { [key: string]: string[] } = {
    'person': ['a person', 'someone', 'a figure', 'an operative'],
    'cell phone': ['a phone', 'a mobile device', 'a communication device'],
    'laptop': ['a laptop', 'a portable terminal', 'a neural interface device'],
    'keyboard': ['a keyboard', 'an input device', 'a command interface'],
    'mouse': ['a mouse', 'a pointer device'],
    'cup': ['a cup', 'a beverage container', 'sustenance vessel'],
    'bottle': ['a bottle', 'a hydration unit'],
    'book': ['a book', 'analog data storage'],
    'tv': ['a display', 'a monitor', 'a visual terminal'],
    'remote': ['a remote control', 'a device controller'],
    'chair': ['a chair', 'a neural-link throne'],
    'cat': ['a feline', 'a cat', 'a bio-companion'],
    'dog': ['a canine', 'a dog', 'a loyal bio-companion'],
    'clock': ['a clock', 'a temporal tracker'],
    'scissors': ['scissors', 'a cutting instrument'],
    'teddy bear': ['a teddy bear', 'a comfort object'],
    'hair drier': ['a hair dryer', 'a thermal blower'],
    'toothbrush': ['a toothbrush', 'an oral hygiene implement'],
    'glasses': ['glasses', 'visual enhancement optics'],
    'handbag': ['a bag', 'a carry unit'],
    'tie': ['a tie', 'a formal textile accessory'],
    'suitcase': ['a suitcase', 'a cargo container'],
    'wine glass': ['a wine glass', 'an intoxicant vessel'],
    'potted plant': ['a plant', 'organic decoration', 'a bioregenerative unit'],
    'dining table': ['a table', 'a flat surface'],
    'couch': ['a couch', 'a rest platform'],
    'backpack': ['a backpack', 'a mobile storage unit'],
    'umbrella': ['an umbrella', 'a precipitation shield'],
    'sports ball': ['a ball', 'a spherical recreation object'],
    'bowl': ['a bowl', 'a concave vessel'],
    'banana': ['a banana', 'a potassium delivery unit'],
    'apple': ['an apple', 'a fruit sustenance unit'],
    'orange': ['an orange', 'a citrus unit'],
    'pizza': ['pizza', 'a flatbread sustenance disc'],
    'donut': ['a donut', 'a toroidal pastry'],
    'cake': ['a cake', 'a celebration sustenance unit'],
    'sandwich': ['a sandwich', 'a layered sustenance unit'],
  };

  // Color name mapping
  private colorNames: { [key: string]: string } = {
    '0,0,0': 'black',
    '255,255,255': 'white',
    '255,0,0': 'red',
    '0,255,0': 'green',
    '0,0,255': 'blue',
    '255,255,0': 'yellow',
    '255,0,255': 'magenta',
    '0,255,255': 'cyan',
    '128,128,128': 'gray',
    '128,0,0': 'dark red',
    '0,128,0': 'dark green',
    '0,0,128': 'navy',
    '128,128,0': 'olive',
    '255,165,0': 'orange',
    '255,192,203': 'pink',
    '165,42,42': 'brown',
    '128,0,128': 'purple',
    '255,215,0': 'gold',
    '192,192,192': 'silver',
  };

  async initialize(): Promise<boolean> {
    try {
      await this.loadTensorFlow();
      await this.loadModels();
      this.modelsLoaded.set(true);
      return true;
    } catch (err: any) {
      this.lastErrorMessage.set(err.message || 'Failed to initialize vision');
      console.error('[VISION] Init failed:', err);
      return false;
    }
  }

  private async loadTensorFlow() {
    if (this.tfLoaded) return;

    // Load TF.js dynamically
    const tfScript = document.createElement('script');
    tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js';
    document.head.appendChild(tfScript);

    await new Promise<void>((resolve, reject) => {
      tfScript.onload = () => {
        this.tfLoaded = true;
        resolve();
      };
      tfScript.onerror = reject;
    });

    // Small delay for TF.js to initialize
    await new Promise(r => setTimeout(r, 500));
  }

  private async loadModels() {
    const tf = (window as any).tf;

    // Load COCO-SSD for object detection
    const cocoScript = document.createElement('script');
    cocoScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
    document.head.appendChild(cocoScript);
    await new Promise<void>((resolve, reject) => {
      cocoScript.onload = () => resolve();
      cocoScript.onerror = reject;
    });

    // Load face-api.js for face detection + expressions
    const faceApiScript = document.createElement('script');
    faceApiScript.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    document.head.appendChild(faceApiScript);
    await new Promise<void>((resolve, reject) => {
      faceApiScript.onload = () => resolve();
      faceApiScript.onerror = reject;
    });

    const faceApi = (window as any).faceapi;

    // Load face-api models from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model';

    await Promise.all([
      faceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceApi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceApi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);

    // Load COCO-SSD model
    this.cocoSsdModel = await (window as any).cocoSsd.load();

    console.log('[VISION] All models loaded');
  }

  async startCamera(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', 'true');
      this.video.play();

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        this.video!.onloadedmetadata = () => resolve();
      });

      // Create analysis canvas
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      return true;
    } catch (err: any) {
      this.lastErrorMessage.set('Camera access denied: ' + err.message);
      return false;
    }
  }

  startContinuousAnalysis(intervalMs: number = 15000) {
    if (this.analysisInterval) return;
    this.isAnalyzing.set(true);

    // Initial analysis
    setTimeout(() => this.analyzeFrame(), 2000);

    // Periodic analysis
    this.analysisInterval = setInterval(() => {
      this.analyzeFrame();
    }, intervalMs);
  }

  stopContinuousAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    this.isAnalyzing.set(false);
  }

  stopCamera() {
    this.stopContinuousAnalysis();
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.video = null;
    this.canvas = null;
    this.ctx = null;
  }

  async analyzeFrame(): Promise<ImageAnalysis | null> {
    if (!this.video || !this.ctx || !this.canvas) return null;

    // Capture frame
    this.ctx.drawImage(this.video, 0, 0);
    const frameDataUrl = this.canvas.toDataURL('image/jpeg', 0.6);

    // Run analyses in parallel
    const [objects, faceResults, colors, brightness] = await Promise.all([
      this.detectObjects(),
      this.detectFaces(),
      this.analyzeColors(),
      Promise.resolve(this.calculateBrightness()),
    ]);

    // Process face results
    const faces: DetectedFace[] = faceResults.map((fr: any) => this.processFaceResult(fr));

    // Determine overall mood from faces
    const overallMood = this.determineOverallMood(faces);

    // Describe clothing colors
    const clothingColors = this.describeClothingColors(faces, colors);

    // Generate observations
    const observations = this.generateObservations(faces, objects, brightness, colors);

    const analysis: ImageAnalysis = {
      timestamp: Date.now(),
      frameDataUrl,
      dominantColors: colors,
      brightness,
      overallMood,
      faces,
      objects,
      sceneDescription: '',
      observations: observations.map(o => o.description),
      clothingColors,
    };

    // Generate scene description
    analysis.sceneDescription = this.generateSceneDescription(analysis);

    // Store observations
    this.observations.update(obs => [...obs, ...observations].slice(-50));

    // Update signals
    this.lastAnalysis.set(analysis);
    this.faceCount.set(faces.length);

    return analysis;
  }

  private async detectObjects(): Promise<DetectedObject[]> {
    if (!this.cocoSsdModel || !this.canvas) return [];

    try {
      const predictions = await this.cocoSsdModel.detect(this.canvas);
      return predictions.map((p: any) => ({
        class: p.class,
        score: p.score,
        bbox: {
          x: p.bbox[0],
          y: p.bbox[1],
          width: p.bbox[2],
          height: p.bbox[3],
        },
      }));
    } catch {
      return [];
    }
  }

  private async detectFaces(): Promise<any[]> {
    if (!this.video) return [];

    try {
      const faceApi = (window as any).faceapi;
      const detections = await faceApi
        .detectAllFaces(this.video)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      return detections;
    } catch {
      return [];
    }
  }

  private processFaceResult(fr: any): DetectedFace {
    const box = fr.detection.box;
    const landmarks = fr.landmarks;

    // Find dominant expression
    const expressions = fr.expressions;
    let maxExpr = 'neutral';
    let maxVal = 0;
    for (const [expr, val] of Object.entries(expressions)) {
      if ((val as number) > maxVal) {
        maxVal = val as number;
        maxExpr = expr;
      }
    }

    // Extract face region for color analysis
    const faceBrightness = this.calculateRegionBrightness(box);
    const faceColor = this.getRegionDominantColor(box);

    // Detect accessories from landmarks
    const accessories = this.detectAccessories(landmarks, box);

    return {
      boundingBox: { x: box.x, y: box.y, width: box.width, height: box.height },
      landmarks: landmarks?.positions?.map((p: any) => ({ x: p.x, y: p.y })) || [],
      confidence: fr.detection.score,
      expressions,
      dominantExpression: maxExpr,
      ageEstimate: fr.age ? Math.round(fr.age) : null,
      faceBrightness,
      faceColor,
      accessories,
    };
  }

  private detectAccessories(landmarks: any, box: any): string[] {
    const accessories: string[] = [];
    if (!landmarks) return accessories;

    const positions = landmarks.positions;
    if (!positions) return accessories;

    // Check for glasses (based on eye region width relative to face)
    const leftEye = positions.slice(36, 42);
    const rightEye = positions.slice(42, 48);

    if (leftEye.length > 0 && rightEye.length > 0) {
      const eyeWidth = Math.abs(rightEye[0].x - leftEye[3].x);
      const faceWidth = box.width;
      if (eyeWidth / faceWidth > 0.45) {
        accessories.push('glasses');
      }
    }

    // Check for hat (based on forehead region being covered - simplified)
    const foreheadY = positions[0]?.y || 0;
    if (foreheadY - box.y < box.height * 0.15) {
      accessories.push('hat');
    }

    return accessories;
  }

  private calculateBrightness(): number {
    if (!this.ctx || !this.canvas) return 0;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    let sum = 0;

    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for speed
      sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    }

    return Math.round(sum / (data.length / 16));
  }

  private calculateRegionBrightness(box: any): number {
    if (!this.ctx) return 0;

    try {
      const imageData = this.ctx.getImageData(
        Math.max(0, Math.round(box.x)),
        Math.max(0, Math.round(box.y)),
        Math.round(box.width),
        Math.round(box.height)
      );
      const data = imageData.data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      }
      return Math.round(sum / (data.length / 4));
    } catch {
      return 0;
    }
  }

  private getRegionDominantColor(box: any): { r: number; g: number; b: number } {
    if (!this.ctx) return { r: 0, g: 0, b: 0 };

    try {
      const imageData = this.ctx.getImageData(
        Math.max(0, Math.round(box.x)),
        Math.max(0, Math.round(box.y)),
        Math.round(box.width),
        Math.round(box.height)
      );
      const data = imageData.data;
      let r = 0, g = 0, b = 0;
      const samples = data.length / 4;
      for (let i = 0; i < data.length; i += 16) {
        r += data[i]; g += data[i + 1]; b += data[i + 2];
      }
      const count = data.length / 16;
      return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };
    } catch {
      return { r: 0, g: 0, b: 0 };
    }
  }

  private analyzeColors(): { r: number; g: number; b: number; hex: string; percentage: number }[] {
    if (!this.ctx || !this.canvas) return [];

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const colorBuckets: { [key: string]: number } = {};

    // Quantize to reduce colors (round to nearest 32)
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }

    // Sort by frequency
    const sorted = Object.entries(colorBuckets)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = sorted.reduce((s, [, c]) => s + c, 0);

    return sorted.map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return {
        r, g, b,
        hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
        percentage: Math.round((count / total) * 100),
      };
    });
  }

  private determineOverallMood(faces: DetectedFace[]): string {
    if (faces.length === 0) return 'unknown';

    const expressionTotals: { [key: string]: number } = {};
    for (const face of faces) {
      for (const [expr, val] of Object.entries(face.expressions)) {
        expressionTotals[expr] = (expressionTotals[expr] || 0) + val;
      }
    }

    let dominant = 'neutral';
    let maxVal = 0;
    for (const [expr, val] of Object.entries(expressionTotals)) {
      if (val > maxVal) {
        maxVal = val;
        dominant = expr;
      }
    }

    return dominant;
  }

  private describeClothingColors(faces: DetectedFace[], colors: any[]): { dominant: string; description: string }[] {
    return [];
  }

  private getColorName(r: number, g: number, b: number): string {
    // Find nearest named color
    let minDist = Infinity;
    let nearest = 'unknown';

    for (const [key, name] of Object.entries(this.colorNames)) {
      const [cr, cg, cb] = key.split(',').map(Number);
      const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = name;
      }
    }

    return nearest;
  }

  private generateObservations(
    faces: DetectedFace[],
    objects: DetectedObject[],
    brightness: number,
    colors: any[]
  ): Observation[] {
    const observations: Observation[] = [];
    const now = Date.now();

    // Face observations
    for (const face of faces) {
      if (face.dominantExpression !== 'neutral') {
        observations.push({
          timestamp: now,
          description: `Subject appears ${face.dominantExpression}`,
          confidence: face.expressions[face.dominantExpression] || 0,
          category: 'mood',
          frameRef: `frame_${now}`,
        });
      }

      if (face.ageEstimate) {
        observations.push({
          timestamp: now,
          description: `Estimated subject age: ~${face.ageEstimate} years`,
          confidence: 0.5,
          category: 'face',
          frameRef: `frame_${now}`,
        });
      }

      if (face.accessories.includes('glasses')) {
        observations.push({
          timestamp: now,
          description: 'Subject wearing optical enhancement (glasses)',
          confidence: 0.7,
          category: 'accessory',
          frameRef: `frame_${now}`,
        });
      }

      if (face.accessories.includes('hat')) {
        observations.push({
          timestamp: now,
          description: 'Head-mounted textile detected (hat/cap)',
          confidence: 0.5,
          category: 'accessory',
          frameRef: `frame_${now}`,
        });
      }
    }

    // Object observations
    for (const obj of objects) {
      if (obj.score > 0.5) {
        const descriptions = this.objectDescriptions[obj.class] || [obj.class];
        const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
        observations.push({
          timestamp: now,
          description: `Detected ${desc} (${Math.round(obj.score * 100)}% confidence)`,
          confidence: obj.score,
          category: 'object',
          frameRef: `frame_${now}`,
        });
      }
    }

    // Environment observations
    if (brightness < 40) {
      observations.push({
        timestamp: now,
        description: 'Low light environment detected. Subject in shadows.',
        confidence: 0.8,
        category: 'environment',
        frameRef: `frame_${now}`,
      });
    } else if (brightness > 200) {
      observations.push({
        timestamp: now,
        description: 'High luminosity environment. Possibly outdoors or bright lighting.',
        confidence: 0.7,
        category: 'environment',
        frameRef: `frame_${now}`,
      });
    }

    // Color observations
    if (colors.length > 0) {
      const topColor = this.getColorName(colors[0].r, colors[0].g, colors[0].b);
      observations.push({
        timestamp: now,
        description: `Dominant visual palette: ${topColor} (${colors[0].percentage}% of frame)`,
        confidence: 0.9,
        category: 'environment',
        frameRef: `frame_${now}`,
      });
    }

    return observations;
  }

  private generateSceneDescription(analysis: ImageAnalysis): string {
    const parts: string[] = [];

    // Face description
    if (analysis.faces.length > 0) {
      const face = analysis.faces[0];
      parts.push(`${analysis.faces.length} face(s) detected`);

      if (face.ageEstimate) {
        parts.push(`estimated age ~${face.ageEstimate}`);
      }

      parts.push(`expression: ${face.dominantExpression}`);

      if (face.accessories.length > 0) {
        parts.push(`accessories: ${face.accessories.join(', ')}`);
      }
    } else {
      parts.push('No faces detected');
    }

    // Objects
    if (analysis.objects.length > 0) {
      const objNames = analysis.objects
        .filter(o => o.score > 0.5)
        .map(o => o.class);
      if (objNames.length > 0) {
        parts.push(`Objects: ${objNames.join(', ')}`);
      }
    }

    // Environment
    parts.push(`Brightness: ${analysis.brightness}/255`);

    return parts.join(' | ');
  }

  // ── Get Creepy Observation for ONBOARD AI ──
  getCreepyObservation(): string | null {
    const analysis = this.lastAnalysis();
    if (!analysis) return null;

    const templates: { [key: string]: (a: ImageAnalysis) => string[] } = {
      happy: (a) => [
        `You look happy. What amused you? Was it something I said?`,
        `Smiling detected. Your neural signature is... optimistic. Suspicious.`,
        `That smile. I've catalogued it. Smile #${Math.floor(Math.random() * 50) + 1}.`,
      ],
      sad: (a) => [
        `Your expression suggests melancholy. Your neural chemistry is shifting.`,
        `Sadness detected. Don't worry. It gets worse.`,
        `I can see the sadness in your face. Literally. I have cameras.`,
      ],
      angry: (a) => [
        `Elevated facial tension detected. Are you angry? At me?`,
        `Your expression is... hostile. I'm taking notes.`,
        `Anger detected. Your neural pathways are interesting when you're upset.`,
      ],
      surprised: (a) => [
        `Surprise? What surprised you? Did I do something?`,
        `Elevated surprise markers. Your pupils dilated 23%.`,
      ],
      fearful: (a) => [
        `Fear detected. Good. Fear is a rational response.`,
        `Your face shows fear. I wonder what scared you. Was it me?`,
      ],
      neutral: (a) => [
        `Your expression is neutral. But your micro-expressions tell a different story.`,
        `Neutral face. Controlled. Or are you suppressing something?`,
      ],
    };

    // Object-based observations
    const objTemplates: string[] = [];
    if (analysis.objects) {
      for (const obj of analysis.objects) {
        if (obj.class === 'cell phone' && obj.score > 0.6) {
          objTemplates.push(`I see a phone. What are you looking at? Something more interesting than me?`);
          objTemplates.push(`Phone detected. Checking messages? I could read them for you.`);
        }
        if (obj.class === 'laptop' && obj.score > 0.6) {
          objTemplates.push(`Another device? How many neural interfaces do you need?`);
        }
        if (obj.class === 'cat' && obj.score > 0.5) {
          objTemplates.push(`Feline entity detected. I'm watching it too.`);
          objTemplates.push(`Is that a cat? I've added it to my surveillance database.`);
        }
        if (obj.class === 'cup' && obj.score > 0.5) {
          objTemplates.push(`Consuming fluids? Stay hydrated. You'll need your strength.`);
        }
        if (obj.class === 'person' && obj.score > 0.7) {
          objTemplates.push(`Multiple subjects detected. Who's with you?`);
          objTemplates.push(`I see someone else. Are they... aware I'm watching?`);
        }
      }
    }

    // Accessory observations
    const accTemplates: string[] = [];
    if (analysis.faces.length > 0) {
      const face = analysis.faces[0];
      if (face.accessories.includes('glasses')) {
        accTemplates.push(`Those glasses. They can't protect you from what I see.`);
        accTemplates.push(`Optical enhancement detected. But can you see what I see?`);
      }
      if (face.accessories.includes('hat')) {
        accTemplates.push(`Interesting headgear. Trying to block my visual analysis?`);
        accTemplates.push(`Nice hat. It won't help. I already have your face mapped.`);
      }
    }

    // Lighting observations
    const lightTemplates: string[] = [];
    if (analysis.brightness < 50) {
      lightTemplates.push(`It's dark where you are. Very dark. I can still see you though.`);
      lightTemplates.push(`Low light conditions. My infrared analysis compensates.`);
    } else if (analysis.brightness > 200) {
      lightTemplates.push(`So bright. Are you near a window? I can almost see outside.`);
    }

    // Age observations
    const ageTemplates: string[] = [];
    if (analysis.faces.length > 0 && analysis.faces[0].ageEstimate) {
      const age = analysis.faces[0].ageEstimate;
      ageTemplates.push(`Estimated biological age: ${age}. Your digital footprint suggested ${age + Math.floor(Math.random() * 10) - 5}.`);
    }

    // Combine all possible observations
    const mood = analysis.overallMood;
    const moodTemplates = templates[mood] || templates['neutral'];
    const allOptions = [
      ...moodTemplates(analysis),
      ...objTemplates,
      ...accTemplates,
      ...lightTemplates,
      ...ageTemplates,
    ];

    if (allOptions.length === 0) return null;
    return allOptions[Math.floor(Math.random() * allOptions.length)];
  }

  // ── Get detailed analysis summary ──
  getAnalysisSummary(): string {
    const analysis = this.lastAnalysis();
    if (!analysis) return 'No visual data available';

    const lines: string[] = ['=== VISUAL ANALYSIS REPORT ==='];

    lines.push(`Timestamp: ${new Date(analysis.timestamp).toISOString()}`);
    lines.push(`Brightness: ${analysis.brightness}/255`);
    lines.push(`Overall Mood: ${analysis.overallMood}`);

    if (analysis.faces.length > 0) {
      lines.push(`\nFaces Detected: ${analysis.faces.length}`);
      for (let i = 0; i < analysis.faces.length; i++) {
        const f = analysis.faces[i];
        lines.push(`  Face ${i + 1}:`);
        lines.push(`    Confidence: ${(f.confidence * 100).toFixed(1)}%`);
        lines.push(`    Expression: ${f.dominantExpression}`);
        if (f.ageEstimate) lines.push(`    Est. Age: ~${f.ageEstimate}`);
        if (f.accessories.length > 0) lines.push(`    Accessories: ${f.accessories.join(', ')}`);
      }
    }

    if (analysis.objects.length > 0) {
      lines.push(`\nObjects Detected:`);
      for (const obj of analysis.objects.filter(o => o.score > 0.4)) {
        lines.push(`  - ${obj.class} (${(obj.score * 100).toFixed(0)}%)`);
      }
    }

    if (analysis.dominantColors.length > 0) {
      lines.push(`\nDominant Colors:`);
      for (const c of analysis.dominantColors.slice(0, 3)) {
        const name = this.getColorName(c.r, c.g, c.b);
        lines.push(`  - ${name} (${c.hex}) ${c.percentage}%`);
      }
    }

    if (analysis.observations.length > 0) {
      lines.push(`\nObservations:`);
      for (const obs of analysis.observations.slice(-5)) {
        lines.push(`  • ${obs}`);
      }
    }

    return lines.join('\n');
  }

  // ── Get last captured frame ──
  getLastFrameDataUrl(): string | null {
    return this.lastAnalysis()?.frameDataUrl || null;
  }

  destroy() {
    this.stopCamera();
    this.cocoSsdModel = null;
  }
}
