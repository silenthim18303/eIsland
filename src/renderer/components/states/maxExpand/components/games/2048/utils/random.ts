export class DeterministicRandom {
  private state: number;

  constructor(seed: number) {
    const normalized = (seed >>> 0) || 1;
    this.state = normalized;
  }

  nextInt(bound: number): number {
    if (bound <= 1) return 0;
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state % bound;
  }

  nextDouble(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  getState(): number {
    return this.state;
  }
}
