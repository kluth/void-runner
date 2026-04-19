import { aiService } from './ai.service';
import axios from 'axios';

export interface RealWorldState {
    finance: {
        symbol: string;
        price: number;
        change24h: number;
    }[];
    news: {
        headline: string;
        source: string;
        timestamp: string;
    }[];
    lastSync: string;
}

export class RealWorldService {
  private state: RealWorldState = {
    finance: [
        { symbol: 'BTC', price: 65000, change24h: 1.5 },
        { symbol: 'ETH', price: 3500, change24h: -0.5 },
        { symbol: 'NVDA', price: 900, change24h: 2.1 },
        { symbol: 'TSLA', price: 170, change24h: -1.2 }
    ],
    news: [],
    lastSync: new Date().toISOString()
  };

  async sync() {
    console.log('[REALWORLD] Synchronizing with global data-streams...');
    
    // 1. Financial Sync (Public API)
    try {
        const coinRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        this.state.finance[0].price = coinRes.data.bitcoin.usd;
        this.state.finance[0].change24h = coinRes.data.bitcoin.usd_24h_change;
        this.state.finance[1].price = coinRes.data.ethereum.usd;
        this.state.finance[1].change24h = coinRes.data.ethereum.usd_24h_change;
    } catch (e) {
        console.warn('[REALWORLD] Crypto uplink failed, using last known values.');
    }

    // 2. News Sync (AI-Driven Search Simulation)
    try {
        const newsPrompt = `Extract 3 actual, major tech or cybersecurity headlines from the last 24 hours. 
        Format as JSON array of objects: [{"headline": "...", "source": "..."}]. 
        Focus on breaches, AI breakthroughs, or financial crashes.`;
        
        const res = await aiService.processQuery(newsPrompt);
        // Attempt to parse JSON from AI response
        const match = res.response.match(/\[.*\]/s);
        if (match) {
            const parsed = JSON.parse(match[0]);
            this.state.news = parsed.map((n: any) => ({
                ...n,
                timestamp: new Date().toISOString()
            }));
        }
    } catch (e) {
        console.warn('[REALWORLD] Cultural crawl failed.');
    }

    this.state.lastSync = new Date().toISOString();
    return this.state;
  }

  getState() {
    return this.state;
  }
}

export const realWorldService = new RealWorldService();
