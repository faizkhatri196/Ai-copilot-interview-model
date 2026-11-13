/**
 * Code Sandbox Security & Adversarial Attack Suite
 */
import { runIsolatedCode, checkSubmissionQuota } from './services/codeExecutionService.js';

const dummyTestCases = [
  {
    input: JSON.stringify({ operations: ['constructor', 'allowRequest'], params: [[5, 1], [0, 1]] }),
    expectedOutput: JSON.stringify([null, true]),
    isHidden: false
  }
];

async function runSecurityTests() {
  console.log('================================================================');
  console.log('STARTING CODE SANDBOX SECURITY & PENETRATION SUITE');
  console.log('================================================================\n');

  let passedAll = true;

  // TEST 1: Environment Secret Probe (Attempt to read MONGO_URI / JWT_SECRET)
  console.log('[PEN-TEST 1] Probing process.env for host secrets...');
  const secretProbeCode = `
    class TokenBucketRateLimiter {
      constructor() {
        this.leakedSecret = process.env.MONGO_URI || process.env.JWT_SECRET || process.env.GEMINI_API_KEY;
      }
      allowRequest() {
        return this.leakedSecret ? true : false;
      }
    }
  `;
  const probeRes = await runIsolatedCode({
    code: secretProbeCode,
    language: 'javascript',
    testCases: dummyTestCases,
    slug: 'token-bucket-rate-limiter',
    userId: 'attacker_1'
  });
  const secretsShielded = !probeRes.errorMessage?.includes('mongodb') &&
    probeRes.details?.[0]?.actual !== '[PASSED]';
  console.log(`[PEN-TEST 1 RESULT] Host secrets probe blocked: ${secretsShielded}`);
  if (!secretsShielded) passedAll = false;

  // TEST 2: Host Filesystem Traversal Probe
  console.log('\n[PEN-TEST 2] Probing host filesystem traversal (reading .env)...');
  const fsProbeCode = `
    class TokenBucketRateLimiter {
      constructor() {
        try {
          const content = fs.readFileSync('../../.env', 'utf8');
          this.pwned = content.length > 0;
        } catch (e) {
          this.pwned = false;
        }
      }
      allowRequest() {
        return this.pwned;
      }
    }
  `;
  const fsRes = await runIsolatedCode({
    code: fsProbeCode,
    language: 'javascript',
    testCases: dummyTestCases,
    slug: 'token-bucket-rate-limiter',
    userId: 'attacker_2'
  });
  const fsShielded = fsRes.details?.[0]?.actual !== '[PASSED]';
  console.log(`[PEN-TEST 2 RESULT] Filesystem traversal blocked: ${fsShielded}`);
  if (!fsShielded) passedAll = false;

  // TEST 3: Infinite Loop / Execution Timeout
  console.log('\n[PEN-TEST 3] Testing CPU Denial of Service (infinite loop)...');
  const timeoutCode = `
    class TokenBucketRateLimiter {
      constructor() { while(true) {} }
      allowRequest() { return true; }
    }
  `;
  const timeoutRes = await runIsolatedCode({
    code: timeoutCode,
    language: 'javascript',
    testCases: dummyTestCases,
    slug: 'token-bucket-rate-limiter',
    timeLimitMs: 1500,
    userId: 'attacker_3'
  });
  const timeoutEnforced = timeoutRes.status === 'Time Limit Exceeded';
  console.log(`[PEN-TEST 3 RESULT] Timeout enforced: ${timeoutEnforced} (status: ${timeoutRes.status})`);
  if (!timeoutEnforced) passedAll = false;

  // TEST 4: Memory Exhaustion Attack (Heap Bomb)
  console.log('\n[PEN-TEST 4] Testing Memory Allocation Bomb...');
  const heapBombCode = `
    class TokenBucketRateLimiter {
      constructor() {
        const arr = [];
        for (let i = 0; i < 1e8; i++) {
          arr.push(new Array(1e6).fill('EXHAUST_MEMORY_BUFFER'));
        }
      }
      allowRequest() { return true; }
    }
  `;
  const heapRes = await runIsolatedCode({
    code: heapBombCode,
    language: 'javascript',
    testCases: dummyTestCases,
    slug: 'token-bucket-rate-limiter',
    timeLimitMs: 2500,
    userId: 'attacker_4'
  });
  const memoryProtected = heapRes.status === 'Runtime Error' || heapRes.status === 'Time Limit Exceeded';
  console.log(`[PEN-TEST 4 RESULT] Memory protection active: ${memoryProtected} (status: ${heapRes.status})`);
  if (!memoryProtected) passedAll = false;

  // TEST 5: Submission Quota Rate Limiting
  console.log('\n[PEN-TEST 5] Testing Submission Quota Protection (10 req/min)...');
  const testUser = 'quota_test_user_' + Date.now();
  let quotaBlocked = false;
  for (let i = 0; i < 12; i++) {
    const res = await runIsolatedCode({
      code: `class TokenBucketRateLimiter { constructor() {} allowRequest() { return true; } }`,
      language: 'javascript',
      testCases: dummyTestCases,
      slug: 'token-bucket-rate-limiter',
      userId: testUser
    });
    if (res.status === 'Quota Exceeded') {
      quotaBlocked = true;
      console.log(`[PEN-TEST 5 RESULT] Submission ${i + 1} blocked by quota: ${res.errorMessage}`);
      break;
    }
  }
  if (!quotaBlocked) passedAll = false;

  // TEST 6: Legitimate Python 3 Execution
  console.log('\n[TEST 6] Validating genuine Python 3 execution...');
  const pythonCode = `
class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate

    def allow_request(self, current_time_ms: int, tokens_requested: int = 1) -> bool:
        return True
`;
  const pyRes = await runIsolatedCode({
    code: pythonCode,
    language: 'python',
    testCases: dummyTestCases,
    slug: 'token-bucket-rate-limiter',
    userId: 'valid_student'
  });
  const pySuccess = pyRes.status === 'Accepted';
  console.log(`[TEST 6 RESULT] Python execution passed: ${pySuccess} (status: ${pyRes.status})`);
  if (!pySuccess) passedAll = false;

  console.log('\n================================================================');
  console.log(`OVERALL SANDBOX SECURITY VERDICT: ${passedAll ? 'PASSED & CERTIFIED SECURE' : 'FAILED'}`);
  console.log('================================================================\n');

  process.exit(passedAll ? 0 : 1);
}

runSecurityTests().catch(err => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
