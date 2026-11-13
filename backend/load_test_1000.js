import http from 'http';
import { app } from './server.js';
import jwt from 'jsonwebtoken';
import { memoryStore } from './services/storageFallback.js';

const PORT = 5055; // Dedicated isolated test port

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
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

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 2048, timeout: 10000 });

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
        resolve({
          statusCode: res.statusCode,
          duration,
          success,
          body: data
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

const getWorkflows = (token) => [
  {
    name: 'Auth Profile Check',
    method: 'GET',
    path: '/api/auth/profile',
    headers: { 'Authorization': `Bearer ${token}` }
  },
  {
    name: 'Dashboard Analytics Access',
    method: 'GET',
    path: '/api/analytics/overview',
    headers: { 'Authorization': `Bearer ${token}` }
  },
  {
    name: 'Company Directory Access',
    method: 'GET',
    path: '/api/companies',
    headers: {}
  },
  {
    name: 'Coding Problems Access',
    method: 'GET',
    path: '/api/coding',
    headers: {}
  },
  {
    name: 'Coding Submission Execution',
    method: 'POST',
    path: '/api/coding/token-bucket-rate-limiter/submit',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: {
      code: `class TokenBucketRateLimiter { constructor(c, r) { this.c = c; this.r = r; } allowRequest() { return true; } }`,
      language: 'javascript'
    }
  }
];

/**
 * Execute load stage with N concurrent users
 */
async function runConcurrencyStage(concurrency, stageName, token) {
  console.log(`\n======================================================`);
  console.log(`TESTING STAGE: ${stageName} with ${concurrency} CONCURRENT USERS`);
  console.log(`======================================================`);

  const workflows = getWorkflows(token);

  const stageStartTime = Date.now();
  const allLatencies = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  // Run active concurrent users over a smooth realistic arrival window
  const tasks = [];
  const rampWindowMs = concurrency >= 1000 ? 2500 : (concurrency >= 500 ? 1500 : 600);
  for (let i = 0; i < concurrency; i++) {
    const wf = workflows[i % workflows.length];
    const delayMs = (i / concurrency) * rampWindowMs;
    tasks.push(
      new Promise(resolve => {
        setTimeout(() => {
          makeRequest({
            hostname: '127.0.0.1',
            port: PORT,
            path: wf.path,
            method: wf.method,
            headers: wf.headers
          }, wf.body).then(resolve);
        }, delayMs);
      })
    );
  }

  const results = await Promise.all(tasks);
  const stageDurationMs = Date.now() - stageStartTime;

  const errorSamples = new Map();
  results.forEach(r => {
    allLatencies.push(r.duration);
    if (r.success) successfulRequests++;
    else {
      failedRequests++;
      const key = `${r.statusCode}: ${r.error || (r.body ? r.body.slice(0, 100) : 'unknown')}`;
      errorSamples.set(key, (errorSamples.get(key) || 0) + 1);
    }
  });

  if (failedRequests > 0) {
    console.log('Error Breakdown:');
    errorSamples.forEach((count, desc) => console.log(`  - [${count}x] ${desc}`));
  }

  const percentiles = calculatePercentiles(allLatencies);
  const rps = Math.round((results.length / (stageDurationMs / 1000)));

  console.log(`Completed ${results.length} requests in ${stageDurationMs}ms`);
  console.log(`RPS: ${rps} requests/sec`);
  console.log(`Success Rate: ${((successfulRequests / results.length) * 100).toFixed(2)}% (${successfulRequests} passed, ${failedRequests} failed)`);
  console.log(`Latency: P50=${percentiles.p50}ms | P95=${percentiles.p95}ms | P99=${percentiles.p99}ms | Avg=${percentiles.avg}ms | Min=${percentiles.min}ms | Max=${percentiles.max}ms`);

  const mem = process.memoryUsage();
  console.log(`Memory Footprint: RSS=${Math.round(mem.rss / 1024 / 1024)}MB | Heap=${Math.round(mem.heapUsed / 1024 / 1024)}MB`);

  return {
    concurrency,
    rps,
    durationMs: stageDurationMs,
    totalRequests: results.length,
    successfulRequests,
    failedRequests,
    errorPercentage: ((failedRequests / results.length) * 100).toFixed(2),
    percentiles,
    memoryRssMb: Math.round(mem.rss / 1024 / 1024),
    memoryHeapMb: Math.round(mem.heapUsed / 1024 / 1024)
  };
}

async function main() {
  console.log('Starting isolated HTTP test server on port', PORT);
  const testServer = http.createServer(app);

  await new Promise((resolve) => {
    testServer.listen(PORT, '127.0.0.1', 2048, resolve);
  });

  console.log(`Test server running on http://127.0.0.1:${PORT}`);

  // Ensure valid test candidate exists
  let user = await memoryStore.findUserByEmail('loadtest@interviewcopilot.ai');
  if (!user) {
    user = await memoryStore.createUser({
      name: 'Load Test Engineer',
      email: 'loadtest@interviewcopilot.ai',
      password: 'password123'
    });
  }

  // Generate valid authenticated test JWT
  const testToken = jwt.sign(
    { id: String(user._id), email: user.email },
    process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot',
    { expiresIn: '2h' }
  );

  // Warm-up run
  console.log('\nWarming up HTTP pipeline...');
  const workflows = getWorkflows(testToken);
  for (const wf of workflows) {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: wf.path,
      method: wf.method,
      headers: wf.headers
    }, wf.body);
    console.log(`[Warmup] ${wf.name} (${wf.path}) => HTTP ${res.statusCode}: ${res.body.slice(0, 80)}`);
  }
  await sleep(300);

  const reportData = [];

  // 1. 100 Concurrent Users
  reportData.push(await runConcurrencyStage(100, 'Stage 1 (Baseline)', testToken));
  await sleep(500);

  // 2. 250 Concurrent Users
  reportData.push(await runConcurrencyStage(250, 'Stage 2 (Moderate Load)', testToken));
  await sleep(500);

  // 3. 500 Concurrent Users
  reportData.push(await runConcurrencyStage(500, 'Stage 3 (High Concurrency)', testToken));
  await sleep(500);

  // 4. 1,000 Concurrent Users
  reportData.push(await runConcurrencyStage(1000, 'Stage 4 (1,000 Concurrent Peak Target)', testToken));

  testServer.close();
  console.log('\nAll stages complete. Results serialized.');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
