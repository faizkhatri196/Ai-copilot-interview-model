/**
 * AI INTERVIEW INTELLIGENCE 2.1 — REALISTIC SUSTAINED CONCURRENCY BENCHMARK
 * Simulates complete, multi-step active user journeys:
 * Auth -> Analytics -> Company Research -> Interview Create -> Answer Submit -> Coding Sandbox
 */
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from './server.js';
import { memoryStore } from './services/storageFallback.js';

const PORT = 5057;

function calculatePercentiles(latencies) {
  if (!latencies || latencies.length === 0) return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    p50,
    p95,
    p99
  };
}

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 2048, timeout: 15000 });

async function makeRequest(options, postData = null) {
  const start = Date.now();
  const bodyStr = postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : null;
  const reqHeaders = { ...options.headers };
  if (bodyStr) {
    reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    if (!reqHeaders['Content-Type']) reqHeaders['Content-Type'] = 'application/json';
  }

  return new Promise((resolve) => {
    const req = http.request({ ...options, agent: httpAgent, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        const success = res.statusCode >= 200 && res.statusCode < 400;
        let parsed = null;
        try { parsed = JSON.parse(data); } catch {}
        resolve({
          statusCode: res.statusCode,
          duration,
          success,
          body: data,
          parsed
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        duration: Date.now() - start,
        success: false,
        error: err.message
      });
    });

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

/**
 * Execute a complete multi-step active user journey for one candidate
 */
async function executeUserJourney(token, userIndex) {
  const journeyLatencies = [];
  const steps = [
    // Step 1: Session Verification
    { method: 'GET', path: '/api/auth/profile', headers: { Authorization: `Bearer ${token}` } },
    // Step 2: Dashboard Analytics
    { method: 'GET', path: '/api/analytics/overview', headers: { Authorization: `Bearer ${token}` } },
    // Step 3: Company Intelligence
    { method: 'GET', path: '/api/companies', headers: {} },
    // Step 4: Coding Challenge Retrieval
    { method: 'GET', path: '/api/coding', headers: {} },
    // Step 5: Coding Sandbox Execution
    {
      method: 'POST',
      path: '/api/coding/token-bucket-rate-limiter/submit',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        code: `class TokenBucketRateLimiter { constructor(c, r) { this.c = c; this.r = r; } allowRequest() { return true; } }`,
        language: 'javascript'
      }
    }
  ];

  let successCount = 0;
  for (const step of steps) {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: step.path,
      method: step.method,
      headers: step.headers
    }, step.body);

    journeyLatencies.push(res.duration);
    if (res.success) successCount++;
  }

  return {
    userIndex,
    success: successCount === steps.length,
    successSteps: successCount,
    totalSteps: steps.length,
    latencies: journeyLatencies
  };
}

async function runStage(concurrency, stageName, tokens) {
  console.log(`\n======================================================`);
  console.log(`BENCHMARKING: ${stageName} with ${concurrency} CONCURRENT ACTIVE USERS`);
  console.log(`Total Operations: ${concurrency} users x 5 steps = ${concurrency * 5} HTTP requests`);
  console.log(`======================================================`);

  const startTime = Date.now();
  const rampWindowMs = concurrency >= 1000 ? 3000 : (concurrency >= 500 ? 1800 : 800);
  const tasks = [];

  for (let i = 0; i < concurrency; i++) {
    const token = tokens[i % tokens.length];
    const delayMs = (i / concurrency) * rampWindowMs;

    tasks.push(
      new Promise(resolve => {
        setTimeout(() => {
          executeUserJourney(token, i).then(resolve);
        }, delayMs);
      })
    );
  }

  const results = await Promise.all(tasks);
  const totalDurationMs = Date.now() - startTime;

  const allLatencies = [];
  let successfulUsers = 0;
  let totalSuccessfulOps = 0;

  results.forEach(r => {
    allLatencies.push(...r.latencies);
    totalSuccessfulOps += r.successSteps;
    if (r.success) successfulUsers++;
  });

  const totalOps = concurrency * 5;
  const percentiles = calculatePercentiles(allLatencies);
  const rps = Math.round((totalOps / (totalDurationMs / 1000)));

  console.log(`Duration:       ${totalDurationMs}ms`);
  console.log(`Throughput:     ${rps} operations/sec`);
  console.log(`User Success:   ${((successfulUsers / concurrency) * 100).toFixed(2)}% (${successfulUsers}/${concurrency} complete journeys)`);
  console.log(`Op Success:     ${((totalSuccessfulOps / totalOps) * 100).toFixed(2)}% (${totalSuccessfulOps}/${totalOps} HTTP requests)`);
  console.log(`Latency:        P50=${percentiles.p50}ms | P95=${percentiles.p95}ms | P99=${percentiles.p99}ms | Avg=${percentiles.avg}ms | Min=${percentiles.min}ms | Max=${percentiles.max}ms`);

  const mem = process.memoryUsage();
  console.log(`Memory Footprint: RSS=${Math.round(mem.rss / 1024 / 1024)}MB | Heap=${Math.round(mem.heapUsed / 1024 / 1024)}MB`);

  return {
    concurrency,
    totalOps,
    rps,
    durationMs: totalDurationMs,
    successfulUsers,
    userSuccessRate: ((successfulUsers / concurrency) * 100).toFixed(2),
    opSuccessRate: ((totalSuccessfulOps / totalOps) * 100).toFixed(2),
    percentiles,
    rssMb: Math.round(mem.rss / 1024 / 1024),
    heapMb: Math.round(mem.heapUsed / 1024 / 1024),
  };
}

async function main() {
  console.log('Starting Benchmark Server on port', PORT);
  const server = http.createServer(app);
  await new Promise(r => server.listen(PORT, '127.0.0.1', 2048, r));

  // Pre-seed authenticated test users and JWTs
  console.log('Pre-generating active authenticated user pool...');
  const tokens = [];
  for (let i = 0; i < 20; i++) {
    const user = await memoryStore.createUser({
      name: `Active Candidate ${i + 1}`,
      email: `benchmark_user_${i + 1}_${Date.now()}@interview.ai`,
      password: 'password123!'
    });
    const token = jwt.sign(
      { id: String(user._id), email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot',
      { expiresIn: '4h' }
    );
    tokens.push(token);
  }

  const reports = [];

  // STAGE A: 100 Concurrent Users (500 Ops)
  reports.push(await runStage(100, 'Stage A (Baseline)', tokens));
  await new Promise(r => setTimeout(r, 600));

  // STAGE B: 250 Concurrent Users (1,250 Ops)
  reports.push(await runStage(250, 'Stage B (Moderate Concurrency)', tokens));
  await new Promise(r => setTimeout(r, 600));

  // STAGE C: 500 Concurrent Users (2,500 Ops)
  reports.push(await runStage(500, 'Stage C (High Concurrency)', tokens));
  await new Promise(r => setTimeout(r, 800));

  // STAGE D: 1,000 Concurrent Users (5,000 Ops)
  reports.push(await runStage(1000, 'Stage D (Peak 1,000 Concurrent Target)', tokens));

  server.close();
  console.log('\n======================================================');
  console.log('ALL BENCHMARK STAGES COMPLETED SUCCESSFULLY.');
  console.log('======================================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Benchmark fatal error:', err);
  process.exit(1);
});

