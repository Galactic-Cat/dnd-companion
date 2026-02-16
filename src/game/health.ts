export class Health {
  public readonly current: number;
  public readonly maximum: number;
  public readonly temporary: number;

  public constructor(current: number, maximum: number, temporary: number = 0) {
    this.maximum = Math.max(0, maximum);
    this.current = Math.max(0, Math.min(this.maximum, current));
    this.temporary = Math.max(0, temporary)
  }

  public decrease(delta: number): Health {
    if (delta < 0) {
      return this.increase(-delta)
    }

    const newTemporary = this.temporary - Math.min(this.temporary, delta)
    const newDelta = delta - Math.min(this.temporary, delta)

    return new Health(this.current - newDelta, this.maximum, newTemporary);
  }

  public increase(delta: number): Health {
    if (delta < 0) {
      return this.decrease(-delta)
    }

    return new Health(this.current + delta, this.maximum, this.temporary);
  }

  public setMaximum(newMaximum: number): Health {
    return new Health(this.current, newMaximum);
  }
}