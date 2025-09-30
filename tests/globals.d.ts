declare module 'node:test' {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void): void
  export function beforeEach(fn: () => void): void
}

declare module 'node:assert/strict' {
  const assert: {
    deepStrictEqual(actual: unknown, expected: unknown): void
    strictEqual(actual: unknown, expected: unknown): void
  }
  export default assert
}

declare const process: {
  client?: boolean
}
