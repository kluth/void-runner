import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Quantum-Encrypted Data Vault (Issue #42)', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should deposit credits into the vault', () => {
    service.credits.set(1000);
    service.vaultCredits.set(0);
    
    const success = service.depositToVault(500);
    expect(success).toBe(true);
    expect(service.credits()).toBe(500);
    expect(service.vaultCredits()).toBe(500);
  });

  it('should withdraw credits from the vault', () => {
    service.credits.set(0);
    service.vaultCredits.set(1000);
    
    const success = service.withdrawFromVault(300);
    expect(success).toBe(true);
    expect(service.credits()).toBe(300);
    expect(service.vaultCredits()).toBe(700);
  });

  it('should not affect vault contents during system wipe', () => {
    service.vaultCredits.set(5000);
    service.credits.set(1000);
    
    service.executeSystemWipe();
    
    expect(service.credits()).toBe(0);
    expect(service.vaultCredits()).toBe(5000);
  });
});
