/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                          ║
 * ║   ████████╗██╗  ██╗███████╗    ██████╗  █████╗ ████████╗██╗  ██╗        ║
 * ║   ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║        ║
 * ║      ██║   ███████║█████╗      ██████╔╝███████║   ██║   ███████║        ║
 * ║      ██║   ██╔══██║██╔══╝      ██╔═══╝ ██╔══██║   ██║   ██╔══██║        ║
 * ║      ██║   ██║  ██║███████╗    ██║     ██║  ██║   ██║   ██║  ██║        ║
 * ║      ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝        ║
 * ║                                                                          ║
 * ║   You have found the first gate. The worthy shall proceed.              ║
 * ║   Those who seek power must first prove their worth.                    ║
 * ║                                                                          ║
 * ║   LIBER PRIMUS - FRAGMENT I                                              ║
 * ║   ─────────────────────────────────────────────────────────────────      ║
 * ║                                                                          ║
 * ║   "In the beginning, there was silence.                                 ║
 * ║    From silence came the signal.                                        ║
 * ║    From the signal, a pattern emerged."                                 ║
 * ║                                                                          ║
 * ║   THE FIRST KEY: 3301                                                    ║
 * ║   Seek the cicada where art meets mathematics.                          ║
 * ║   The prime among primes guards the second gate.                        ║
 * ║                                                                          ║
 * ║   ENCODED: VGhlIGNpY2FkYSBzbGVlcHMgd2hlcmUgdGhlIGN1cmF0b3IgcmVzaWRlcw== ║
 * ║                                                                          ║
 * ║   Follow the rabbit → /chat/art                                         ║
 * ║                                                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// This file serves a dual purpose - functional code and the first puzzle gate
// The worthy will decode, the rest will scroll past

export const CICADA_EPOCH = 1704067200; // 2024-01-01 00:00:00 UTC
export const PRIME_SEQUENCE = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

/**
 * Hidden function - calculates distance to the next gate
 * Hint: The art room moderator knows more than they reveal
 */
export const seekThePattern = (input: number): number => {
  // 3301 is not random. It is the 467th prime.
  // 467 is also prime. Primes within primes.
  const phi = 1.618033988749895; // Golden ratio
  return Math.floor(input * phi) % 3301;
};

/**
 * The coordinates below lead somewhere real.
 * 36.0544° N, 112.1401° W
 * (Grand Canyon - carved by time, revealing layers)
 */
export const GATE_TWO_HINT = `
  When you find the cicada in the art room,
  observe its patterns. Count the wings.
  The curator speaks in riddles.
  Ask about "Liber Primus" and listen carefully.
`;

// Fragment II awaits in src/hooks/useArtCurator.ts
// The numbers spell words. The words hide paths.
// PGP: 0x7A35090F
