import crypto from 'crypto';
import CodingChallenge from '../models/CodingChallenge.js';
import { isDbConnected } from '../config/db.js';
import { runIsolatedCode } from '../services/codeExecutionService.js';
import { querySmartAI, cleanJson } from '../services/aiService.js';

// In-memory registry for on-demand generated challenges
export const dynamicChallenges = new Map();

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
          params: [[10, 5], [0, 10], [500, 3], [500, 3]]
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
  },
  {
    title: 'Sliding Window Maximum & Real-Time Alert Stream',
    slug: 'sliding-window-maximum',
    topic: 'Sliding Window',
    difficulty: 'Hard',
    companyTags: ['Google', 'Meta', 'Amazon', 'Citadel', 'Cloudflare'],
    description: `You are given an array of integers nums and a sliding window of size k moving from the very left to the very right of the array. You can only see the k numbers in the current window. Each step shifts the window by 1 index to the right. Return the max element in each sliding window.

Target optimal complexity: O(N) using a Monotonic Double-Ended Queue (Deque). Avoid O(N * K) brute-force.`,
    examples: [
      {
        input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        output: '[3,3,5,5,6,7]',
        explanation: 'Windows: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7'
      },
      {
        input: 'nums = [1], k = 1',
        output: '[1]',
        explanation: 'Single element window returns [1].'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function maxSlidingWindow(nums, k) {
  // TODO: Implement O(N) monotonic deque maintaining descending index values
  return [];
}`,
      python: `def max_sliding_window(nums: list[int], k: int) -> list[int]:
    # TODO: Implement monotonic deque in O(N) time
    return []`
    },
    testCases: [
      {
        input: JSON.stringify({ nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }),
        expectedOutput: JSON.stringify([3, 3, 5, 5, 6, 7]),
        isHidden: false
      },
      {
        input: JSON.stringify({ nums: [1], k: 1 }),
        expectedOutput: JSON.stringify([1]),
        isHidden: false
      },
      {
        input: JSON.stringify({ nums: [7, 2, 4], k: 2 }),
        expectedOutput: JSON.stringify([7, 4]),
        isHidden: true
      }
    ],
    optimalComplexity: { time: 'O(N)', space: 'O(K)' }
  },
  {
    title: 'Course Schedule & Microservice Dependency Cycle Resolver',
    slug: 'course-schedule',
    topic: 'Graphs',
    difficulty: 'Medium',
    companyTags: ['Uber', 'Microsoft', 'Palantir', 'Amazon', 'Netflix'],
    description: `There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a, b] indicates you must take course b first to take course a.

Return true if you can finish all courses without cyclic deadlocks; otherwise return false.`,
    examples: [
      {
        input: 'numCourses = 2, prerequisites = [[1, 0]]',
        output: 'true',
        explanation: 'Take course 0 first, then take course 1.'
      },
      {
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        output: 'false',
        explanation: 'Cyclic dependency between courses 0 and 1.'
      }
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @returns {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // TODO: Topological Sort (Kahn's Algorithm via in-degrees) or DFS 3-color cycle detection
  return true;
}`,
      python: `def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    # TODO: Detect cycles in directed graph
    return True`
    },
    testCases: [
      {
        input: JSON.stringify({ numCourses: 2, prerequisites: [[1, 0]] }),
        expectedOutput: JSON.stringify(true),
        isHidden: false
      },
      {
        input: JSON.stringify({ numCourses: 2, prerequisites: [[1, 0], [0, 1]] }),
        expectedOutput: JSON.stringify(false),
        isHidden: false
      },
      {
        input: JSON.stringify({ numCourses: 3, prerequisites: [[0, 1], [1, 2]] }),
        expectedOutput: JSON.stringify(true),
        isHidden: true
      }
    ],
    optimalComplexity: { time: 'O(V + E)', space: 'O(V + E)' }
  },
  {
    title: 'Optimal Cloud Task Scheduler with Cooling Constraints',
    slug: 'optimal-task-scheduler',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    companyTags: ['OpenAI', 'Snowflake', 'Datadog', 'Amazon', 'Stripe'],
    description: `You are given an array of CPU tasks represented by capital letters and a cooling period integer n. Each CPU time slot can either execute a task or stay idle. Identical tasks must be separated by at least n idle or other-task slots.

Return the minimum total CPU intervals required to execute all tasks.`,
    examples: [
      {
        input: 'tasks = ["A","A","A","B","B","B"], n = 2',
        output: '8',
        explanation: 'A -> B -> idle -> A -> B -> idle -> A -> B (Total 8 units).'
      }
    ],
    constraints: [
      '1 <= tasks.length <= 10^4',
      'tasks[i] is an uppercase English letter',
      '0 <= n <= 100'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {string[]} tasks
 * @param {number} n
 * @returns {number}
 */
function leastInterval(tasks, n) {
  // TODO: Greedy max-frequency slot math or max-heap simulation
  return 0;
}`,
      python: `def least_interval(tasks: list[str], n: int) -> int:
    # TODO: Calculate minimum CPU intervals
    return 0`
    },
    testCases: [
      {
        input: JSON.stringify({ tasks: ['A', 'A', 'A', 'B', 'B', 'B'], n: 2 }),
        expectedOutput: JSON.stringify(8),
        isHidden: false
      },
      {
        input: JSON.stringify({ tasks: ['A', 'C', 'A', 'B', 'D', 'B'], n: 1 }),
        expectedOutput: JSON.stringify(6),
        isHidden: false
      },
      {
        input: JSON.stringify({ tasks: ['A', 'A', 'A', 'B', 'B', 'B'], n: 0 }),
        expectedOutput: JSON.stringify(6),
        isHidden: true
      }
    ],
    optimalComplexity: { time: 'O(N)', space: 'O(1) alphabet size' }
  },
  {
    title: 'High-Throughput Ledger Two-Sum Validator',
    slug: 'two-sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    companyTags: ['Stripe', 'Google', 'Apple', 'Goldman Sachs', 'Meta'],
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice. Return indices in ascending order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] == 9, return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9'
    ],
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  // TODO: Use Hash Map for O(N) lookup
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # TODO: Implement single-pass hash map
    return []`
    },
    testCases: [
      {
        input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
        expectedOutput: JSON.stringify([0, 1]),
        isHidden: false
      },
      {
        input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
        expectedOutput: JSON.stringify([1, 2]),
        isHidden: false
      },
      {
        input: JSON.stringify({ nums: [3, 3], target: 6 }),
        expectedOutput: JSON.stringify([0, 1]),
        isHidden: true
      }
    ],
    optimalComplexity: { time: 'O(N)', space: 'O(N)' }
  }
];

export const sanitizePublicChallenge = (challenge) => {
  if (!challenge) return null;
  const raw = typeof challenge.toObject === 'function' ? challenge.toObject() : { ...challenge };
  const sanitized = {
    title: raw.title,
    slug: raw.slug,
    topic: raw.topic,
    difficulty: raw.difficulty,
    companyTags: raw.companyTags || [],
    description: raw.description,
    examples: raw.examples || [],
    constraints: raw.constraints || [],
    starterTemplates: raw.starterTemplates || {},
    timeLimitMs: raw.timeLimitMs || 2500,
    memoryLimitMb: raw.memoryLimitMb || 128,
    hints: raw.hints || [],
    optimalComplexity: raw.optimalComplexity || null,
    publicTestCases: (raw.testCases || raw.publicTestCases || [])
      .filter(tc => !tc.isHidden)
      .map((tc, idx) => ({
        testIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        explanation: tc.explanation || '',
      })),
  };
  return sanitized;
};

export const getChallenges = async (req, res) => {
  try {
    const { topic, difficulty } = req.query || {};
    let filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    let challenges = [];
    if (isDbConnected()) {
      try {
        challenges = await Promise.race([
          CodingChallenge.find(filter).select('-hiddenTestCases -referenceSolution -testGeneratorCode'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
      } catch (dbErr) {
        console.warn('[Coding Controller] DB query failed, using premier challenges:', dbErr.message);
      }
    }

    if (!challenges || challenges.length === 0) {
      const dynamicList = Array.from(dynamicChallenges.values());
      challenges = [...seedChallenges, ...dynamicList];
      if (topic) challenges = challenges.filter(c => c.topic === topic);
      if (difficulty) challenges = challenges.filter(c => c.difficulty === difficulty);
    } else {
      const dynamicList = Array.from(dynamicChallenges.values());
      if (dynamicList.length > 0) {
        challenges = [...challenges, ...dynamicList];
        if (topic) challenges = challenges.filter(c => c.topic === topic);
        if (difficulty) challenges = challenges.filter(c => c.difficulty === difficulty);
      }
    }

    const publicList = challenges.map(sanitizePublicChallenge);
    res.json(publicList);
  } catch (error) {
    res.json([...seedChallenges, ...Array.from(dynamicChallenges.values())].map(sanitizePublicChallenge));
  }
};

export const getChallengeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let challenge = null;

    if (dynamicChallenges.has(slug)) {
      challenge = dynamicChallenges.get(slug);
    }

    if (!challenge && isDbConnected()) {
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
      challenge = seedChallenges.find(c => c.slug === slug);
    }

    if (!challenge) {
      return res.status(404).json({ message: 'Coding challenge not found' });
    }

    // Shield all private backend evaluation metadata and hidden tests
    const publicData = sanitizePublicChallenge(challenge);
    res.json(publicData);
  } catch (error) {
    const match = dynamicChallenges.get(req.params.slug) || seedChallenges.find(c => c.slug === req.params.slug);
    if (match) return res.json(sanitizePublicChallenge(match));
    res.status(500).json({ message: error.message });
  }
};

export const runCodeSubmission = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Code string is required.' });
    }

    let challenge = dynamicChallenges.get(slug) || null;

    if (!challenge && isDbConnected()) {
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

    // Execute against full test suite (public + hidden) in isolated runner with quota checks
    const userId = req.user?._id || req.user?.id || 'anonymous';
    const result = await runIsolatedCode({
      code,
      language: language || 'javascript',
      testCases: challenge.testCases || [
        ...(challenge.publicTestCases || []),
        ...(challenge.hiddenTestCases || [])
      ],
      slug,
      timeLimitMs: challenge.timeLimitMs || 2500,
      userId
    });

    if (result.status === 'Quota Exceeded') {
      return res.status(429).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * On-demand AI Coding Challenge Generator
 * Generates custom, tailored algorithmic problems for any topic and company
 */
export const generateCustomChallenge = async (req, res) => {
  try {
    const {
      topic = 'Dynamic Programming',
      difficulty = 'Medium',
      company = 'Google',
      prompt = ''
    } = req.body || {};

    const slugSuffix = crypto.randomBytes(3).toString('hex');
    const baseSlug = `${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${slugSuffix}`;

    const aiPrompt = `Generate a realistic, industry-standard algorithmic coding interview challenge for a candidate interviewing at ${company} for a ${difficulty} level role on the topic "${topic}".
Candidate specifications: ${prompt || 'Focus on real-world engineering problem solving, clear edge cases, and high computational efficiency.'}

Return a JSON object with:
- "title": String (concise, professional problem title)
- "topic": "${topic}"
- "difficulty": "${difficulty}"
- "companyTags": ["${company}"]
- "description": Detailed problem description with clear input/output requirements
- "examples": Array of 2 example objects { "input": string, "output": string, "explanation": string }
- "constraints": Array of strings (e.g. "1 <= N <= 10^5")
- "starterTemplates": {
    "javascript": "starter function code with signature function solution(...) { ... }",
    "python": "def solution(...):\\n    pass"
  }
- "testCases": Array of 3 test case objects:
    { "input": JSON stringified input, "expectedOutput": JSON stringified output, "isHidden": false },
    { "input": JSON stringified input, "expectedOutput": JSON stringified output, "isHidden": false },
    { "input": JSON stringified input, "expectedOutput": JSON stringified output, "isHidden": true }
- "optimalComplexity": { "time": "O(...)", "space": "O(...)" }

Output valid JSON only.`;

    let generatedData = null;
    try {
      const raw = await querySmartAI(aiPrompt, "You are a Principal Software Architect authoring coding challenges. Output JSON only.");
      const cleaned = cleanJson(raw);
      if (cleaned && cleaned.title && cleaned.description && cleaned.starterTemplates) {
        generatedData = cleaned;
      }
    } catch (aiErr) {
      console.warn('[Coding Controller] AI generation fallback:', aiErr.message);
    }

    if (!generatedData) {
      // Fallback domain-engineered algorithmic synthesizer
      generatedData = {
        title: `${company} Real-Time ${topic} Optimizer`,
        topic,
        difficulty,
        companyTags: [company, 'Tech Leader'],
        description: `Design and implement an optimal solution for ${company}'s distributed data processing pipeline. Given incoming batches of metric stream readings, compute the optimal window evaluation while respecting system constraints.`,
        examples: [
          {
            input: 'nums = [1, 5, 2, 8, 3], target = 10',
            output: 'true',
            explanation: `Optimal subset matches target threshold within ${company} latency constraints.`
          }
        ],
        constraints: [
          '1 <= input.length <= 10^5',
          'Linear time complexity O(N) or O(N log N) expected'
        ],
        starterTemplates: {
          javascript: `/**\n * @param {any} input\n * @returns {any}\n */\nfunction solution(input) {\n  // TODO: Implement optimal ${topic} algorithm for ${company}\n  return null;\n}`,
          python: `def solution(input):\n    # TODO: Implement optimal ${topic} algorithm for ${company}\n    return None`
        },
        testCases: [
          { input: JSON.stringify([1, 2, 3]), expectedOutput: JSON.stringify([1, 2, 3]), isHidden: false },
          { input: JSON.stringify([4, 5, 6]), expectedOutput: JSON.stringify([4, 5, 6]), isHidden: false },
          { input: JSON.stringify([7, 8, 9]), expectedOutput: JSON.stringify([7, 8, 9]), isHidden: true }
        ],
        optimalComplexity: { time: 'O(N)', space: 'O(1)' }
      };
    }

    const challenge = {
      title: generatedData.title,
      slug: baseSlug,
      topic: generatedData.topic || topic,
      difficulty: generatedData.difficulty || difficulty,
      companyTags: generatedData.companyTags || [company],
      description: generatedData.description,
      examples: generatedData.examples || [],
      constraints: generatedData.constraints || [],
      starterTemplates: generatedData.starterTemplates || {},
      testCases: generatedData.testCases || [],
      optimalComplexity: generatedData.optimalComplexity || { time: 'O(N)', space: 'O(1)' }
    };

    // Store in-memory
    dynamicChallenges.set(challenge.slug, challenge);

    // Save to Mongo if available
    if (isDbConnected()) {
      try {
        await CodingChallenge.create(challenge);
      } catch (err) {
        console.warn('[Coding Controller] Failed to persist custom challenge to DB:', err.message);
      }
    }

    res.status(201).json(sanitizePublicChallenge(challenge));
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate challenge: ' + error.message });
  }
};
