import CodingChallenge from '../models/CodingChallenge.js';
import { isDbConnected } from '../config/db.js';
import { runIsolatedCode } from '../services/codeExecutionService.js';

export const seedChallenges = [
  {
    title: 'Distributed Token Bucket Rate Limiter',
    slug: 'token-bucket-rate-limiter',
    topic: 'Distributed Systems & Concurrency',
    difficulty: 'Medium',
    companyTags: ['Stripe', 'Uber', 'Cloudflare', 'AWS'],
    description: `Design and implement an in-memory Token Bucket Rate Limiter (TokenBucketRateLimiter) utilized by modern API gateways to regulate traffic surges.

The constructor receives two arguments:
1. capacity: Maximum burst capacity of tokens the bucket can hold.
2. refillRate: Number of tokens added to the bucket per second.

Implement the method allowRequest(currentTimeMs, tokensRequested = 1):
- Refill tokens proportionally to the elapsed time between the current timestamp and the last refill event (capped at capacity).
- If the current token count is >= tokensRequested, deduct tokensRequested and return true.
- Otherwise, return false without deducting tokens.`,
    examples: [
      {
        input: 'operations = ["constructor", "allowRequest", "allowRequest"], params = [[5, 1], [0, 5], [0, 1]]',
        output: '[null, true, false]',
        explanation: 'Bucket starts with 5 tokens. Consumes 5 at t=0 (returns true). Second request at t=0 has 0 tokens left (returns false).'
      },
      {
        input: 'operations = ["constructor", "allowRequest", "allowRequest"], params = [[5, 2], [0, 5], [1000, 2]]',
        output: '[null, true, true]',
        explanation: 'At t=1000ms (1 second later), 2 tokens have been refilled, so request for 2 tokens succeeds.'
      }
    ],
    constraints: [
      '1 <= capacity <= 10^6',
      '1 <= refillRate <= 10^5',
      'Timestamps are monotonically increasing: 0 <= currentTimeMs <= 10^12',
      'tokensRequested >= 1'
    ],
    starterTemplates: {
      javascript: `class TokenBucketRateLimiter {
  /**
   * @param {number} capacity - Maximum burst tokens
   * @param {number} refillRate - Tokens added per second
   */
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTime = 0;
  }

  /**
   * @param {number} currentTimeMs - Timestamp in milliseconds
   * @param {number} tokensRequested - Tokens to consume
   * @returns {boolean} - true if request permitted, false if rate limited
   */
  allowRequest(currentTimeMs, tokensRequested = 1) {
    // TODO: 1. Calculate elapsed time since this.lastRefillTime
    // TODO: 2. Add refilled tokens (elapsedSeconds * refillRate), capped at capacity
    // TODO: 3. If tokens >= tokensRequested, deduct and return true; else return false
    return false;
  }
}`,
      python: `class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill_time = 0

    def allow_request(self, current_time_ms: int, tokens_requested: int = 1) -> bool:
        # TODO: Implement token refill and deduction logic
        return False`
    },
    testCases: [
      {
        input: JSON.stringify({
          operations: ['constructor', 'allowRequest', 'allowRequest'],
          params: [[5, 1], [0, 5], [0, 1]]
        }),
        expectedOutput: JSON.stringify([null, true, false]),
        isHidden: false
      },
      {
        input: JSON.stringify({
          operations: ['constructor', 'allowRequest', 'allowRequest'],
          params: [[5, 2], [0, 5], [1000, 2]]
        }),
        expectedOutput: JSON.stringify([null, true, true]),
        isHidden: false
      },
      {
        input: JSON.stringify({
          operations: ['constructor', 'allowRequest', 'allowRequest', 'allowRequest'],
          params: [[10, 5], [0, 10], [500, 3], [500, 1]]
        }),
        expectedOutput: JSON.stringify([null, true, false, false]),
        isHidden: true
      }
    ],
    optimalComplexity: { time: 'O(1) per request', space: 'O(1)' }
  },
  {
    title: 'LRU Cache with Time-to-Live (TTL)',
    slug: 'lru-cache-ttl',
    topic: 'Cache Architecture & Data Structures',
    difficulty: 'Medium',
    companyTags: ['Google', 'Meta', 'Netflix', 'Amazon'],
    description: `Implement a Least Recently Used (LRU) Cache supporting key expiration via Time-to-Live (TTL).

Constructor LRUTTLCache(capacity):
- Initialize with positive integer capacity.

get(key, currentTimeMs):
- Return value of key if key exists and has NOT expired (currentTimeMs < expiryTime).
- Update access order (mark as most recently used).
- If key does not exist or has expired, return -1.

set(key, value, ttlMs, currentTimeMs):
- Store key-value with expiry (currentTimeMs + ttlMs).
- If key exists, update value and expiration, and update access order.
- If capacity is exceeded, evict the least recently used valid entry.`,
    examples: [
      {
        input: 'ops = ["constructor", "set", "get", "get"], args = [[2], ["a", 100, 1000, 0], ["a", 500], ["a", 1500]]',
        output: '[null, null, 100, -1]',
        explanation: 'Key "a" expires at t=1000. Access at t=500 returns 100. Access at t=1500 is expired, returning -1.'
      }
    ],
    constraints: [
      '1 <= capacity <= 5000',
      '0 <= ttlMs <= 10^7',
      'Timestamps are non-decreasing'
    ],
    starterTemplates: {
      javascript: `class LRUTTLCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    // TODO: Initialize cache data structures (Map / Doubly Linked List)
  }

  /**
   * @param {string|number} key
   * @param {number} currentTimeMs
   * @returns {any}
   */
  get(key, currentTimeMs) {
    // TODO: Check if key exists and not expired, update recency, return value or -1
    return -1;
  }

  /**
   * @param {string|number} key
   * @param {any} value
   * @param {number} ttlMs
   * @param {number} currentTimeMs
   */
  set(key, value, ttlMs, currentTimeMs) {
    // TODO: Insert/update key, handle capacity eviction
  }
}`,
      python: `class LRUTTLCache:
    def __init__(self, capacity: int):
        self.capacity = capacity

    def get(self, key, current_time_ms: int):
        # TODO: Implement LRU lookup with TTL verification
        return -1

    def set(self, key, value, ttl_ms: int, current_time_ms: int):
        # TODO: Implement insertion with eviction
        pass`
    },
    testCases: [
      {
        input: JSON.stringify({
          ops: ['constructor', 'set', 'get', 'get'],
          args: [[2], ['a', 100, 1000, 0], ['a', 500], ['a', 1500]]
        }),
        expectedOutput: JSON.stringify([null, null, 100, -1]),
        isHidden: false
      },
      {
        input: JSON.stringify({
          ops: ['constructor', 'set', 'set', 'set', 'get'],
          args: [[2], ['x', 1, 5000, 0], ['y', 2, 5000, 0], ['z', 3, 5000, 10], ['x', 20]]
        }),
        expectedOutput: JSON.stringify([null, null, null, null, -1]),
        isHidden: false
      }
    ],
    optimalComplexity: { time: 'O(1) average get/set', space: 'O(capacity)' }
  },
  {
    title: 'Deep JSON Object Flattening & Path Resolver',
    slug: 'flatten-nested-object',
    topic: 'Data Parsing & Tree Traversal',
    difficulty: 'Medium',
    companyTags: ['Datadog', 'Snowflake', 'Palantir', 'Stripe'],
    description: `Given a deeply nested JSON object with mixed dictionaries, arrays, and primitive values, flatten it into a single-level dictionary where keys are string dot-paths and bracketed array indices.

Example:
Input: { user: { name: "Alice", addresses: [{ city: "Seattle" }] } }
Output: { "user.name": "Alice", "user.addresses[0].city": "Seattle" }`,
    examples: [
      {
        input: 'input = {"a": {"b": 1, "c": [2, 3]}}',
        output: '{"a.b": 1, "a.c[0]": 2, "a.c[1]": 3}'
      }
    ],
    constraints: [
      'Input can contain strings, numbers, booleans, null, arrays, and objects',
      'No circular references exist'
    ],
    starterTemplates: {
      javascript: `/**
 * Flattens a nested object/array into key-path pairs.
 * @param {object} obj - Nested JSON object
 * @returns {object} - Flattened single-level dictionary
 */
function flattenObject(obj) {
  // TODO: Recursively traverse nested keys and construct flattened dot/bracket paths
  return {};
}`,
      python: `def flatten_object(obj):
    # TODO: Traverse and flatten nested structure
    return {}`
    },
    testCases: [
      {
        input: JSON.stringify({ a: { b: 1, c: [2, 3] } }),
        expectedOutput: JSON.stringify({ "a.b": 1, "a.c[0]": 2, "a.c[1]": 3 }),
        isHidden: false
      },
      {
        input: JSON.stringify({ user: { profile: { active: true } } }),
        expectedOutput: JSON.stringify({ "user.profile.active": true }),
        isHidden: false
      }
    ],
    optimalComplexity: { time: 'O(N) where N is total nodes', space: 'O(D) recursion depth' }
  }
];

export const getChallenges = async (req, res) => {
  try {
    const { topic, difficulty } = req.query || {};
    let filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    if (isDbConnected()) {
      try {
        const challenges = await Promise.race([
          CodingChallenge.find(filter).select('-testCases.isHidden'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        if (challenges && challenges.length > 0) return res.json(challenges);
      } catch (dbErr) {
        console.warn('[Coding Controller] DB query failed, using premier challenges:', dbErr.message);
      }
    }

    let filtered = seedChallenges;
    if (topic) filtered = filtered.filter(c => c.topic === topic);
    if (difficulty) filtered = filtered.filter(c => c.difficulty === difficulty);
    res.json(filtered);
  } catch (error) {
    res.json(seedChallenges);
  }
};

export const getChallengeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let challenge = null;

    if (isDbConnected()) {
      try {
        challenge = await Promise.race([
          CodingChallenge.findOne({ slug }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
      } catch (dbErr) {
        console.warn('[Coding Controller] DB lookup failed:', dbErr.message);
      }
    }

    if (!challenge) {
      const match = seedChallenges.find(c => c.slug === slug);
      if (match) return res.json(match);
      return res.status(404).json({ message: 'Coding challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    const match = seedChallenges.find(c => c.slug === req.params.slug);
    if (match) return res.json(match);
    res.status(500).json({ message: error.message });
  }
};

export const runCodeSubmission = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;

    let challenge = null;
    if (isDbConnected()) {
      try {
        challenge = await CodingChallenge.findOne({ slug });
      } catch {}
    }
    if (!challenge) {
      challenge = seedChallenges.find(c => c.slug === slug);
    }

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const result = await runIsolatedCode({
      code,
      language: language || 'javascript',
      testCases: challenge.testCases,
      slug,
      timeLimitMs: challenge.timeLimitMs || 2500,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
