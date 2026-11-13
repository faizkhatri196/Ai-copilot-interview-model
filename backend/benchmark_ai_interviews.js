/**
 * AI INTERVIEW INTELLIGENCE 2.2 — MULTI-TURN AI INTERVIEW CONCURRENCY BENCHMARK
 * Simulates complete conversational AI interview sessions:
 * Auth -> Create Interview -> Receive Question -> Submit Answer -> Dynamic Follow-Up -> Submit Answer -> Final Evaluation
 */
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from './server.js';
import { memoryStore } from './services/storageFallback.js';

const PORT = 5058;

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

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 2048, timeout: 20000 });

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
 * Execute a complete multi-turn conversational interview session for one candidate
 */
async function executeInterviewSession(token, candidateIndex) {
  const latencies = [];

  // Step 1: Create Interview
  const createStart = Date.now();
  const createRes = await makeRequest({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/interview/create',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }, {
    company: 'Amazon',
    role: 'SDE Intern',
    difficulty: 'Intermediate',
    roundType: 'System Architecture',
    interviewerPersonality: 'Principal Engineer',
    targetTurns: 2 // 2 dynamic turns for benchmark throughput test
  });

  latencies.push(Date.now() - createStart);
  if (!createRes.success || !createRes.parsed?._id) {
    return { candidateIndex, success: false, error: 'Failed to create interview session', latencies };
  }

  const interviewId = createRes.parsed._id;
  let activeQuestion = createRes.parsed.questions?.[0];

  // Step 2: Submit Answer Turn 1
  const turn1Start = Date.now();
  const submit1Res = await makeRequest({
    hostname: '127.0.0.1',
    port: PORT,
    path: `/api/interview/${interviewId}/submit`,
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }, {
    questionId: activeQuestion?.questionId,
    idempotencyKey: `bench_${interviewId}_t1`,
    answerText: 'In our system architecture, we decoupled traffic ingestion using Kafka topics and utilized Redis for caching session tokens.'
  });

  latencies.push(Date.now() - turn1Start);
  if (!submit1Res.success) {
    return { candidateIndex, success: false, error: 'Failed to submit Turn 1 answer', latencies };
  }

  // Step 3: Submit Answer Turn 2 (Contextual Follow-up)
  const followUpQ = submit1Res.parsed?.nextQuestion;
  const turn2Start = Date.now();
  const submit2Res = await makeRequest({
    hostname: '127.0.0.1',
    port: PORT,
    path: `/api/interview/${interviewId}/submit`,
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  }, {
    questionId: followUpQ?.questionId || 'q_fallback',
    idempotencyKey: `bench_${interviewId}_t2`,
    answerText: 'To handle split-brain network partitions, we implemented Raft consensus with automated leader election and quorum leases.'
  });

  latencies.push(Date.now() - turn2Start);
  if (!submit2Res.success) {
    return { candidateIndex, success: false, error: 'Failed to submit Turn 2 follow-up answer', latencies };
  }

  // Step 4: Retrieve Final Completed Evaluation
  const evalStart = Date.now();
  const evalRes = await makeRequest({
    hostname: '127.0.0.1',
    port: PORT,
    path: `/api/interview/${interviewId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  latencies.push(Date.now() - evalStart);
  const isCompleted = evalRes.success && (evalRes.parsed?.status === 'Completed' || evalRes.parsed?.answers?.length === 2);

  return {
    candidateIndex,
    success: isCompleted,
    interviewId,
    finalScore: evalRes.parsed?.finalScore,
    totalSteps: 4,
    latencies
  };
}

async function runConcurrencyStage(concurrency, stageName, tokens) {
  console.log(`\n======================================================`);
  console.log(`AI INTERVIEW BENCHMARK: ${stageName}`);
  console.log(`Concurrent Sessions: ${concurrency} simultaneous conversational candidates`);
  console.log(`Total Operations: ${concurrency} candidates x 4 conversational steps = ${concurrency * 4} HTTP calls`);
  console.log(`======================================================`);

  const startTime = Date.now();
  const rampWindowMs = concurrency >= 1000 ? 3500 : (concurrency >= 500 ? 2000 : 800);
  const tasks = [];

  for (let i = 0; i < concurrency; i++) {
    const token = tokens[i % tokens.length];
    const delayMs = (i / concurrency) * rampWindowMs;

    tasks.push(
      new Promise(resolve => {
        setTimeout(() => {
          executeInterviewSession(token, i).then(resolve);
        }, delayMs);
      })
    );
  }

  const results = await Promise.all(tasks);
  const totalDurationMs = Date.now() - startTime;

  const allLatencies = [];
  let successfulSessions = 0;

  results.forEach(r => {
    allLatencies.push(...r.latencies);
    if (r.success) successfulSessions++;
  });

  const totalOps = concurrency * 4;
  const percentiles = calculatePercentiles(allLatencies);
  const rps = Math.round((totalOps / (totalDurationMs / 1000)));

  console.log(`Total Duration:       ${totalDurationMs}ms`);
  console.log(`Interview Throughput: ${rps} ops/sec (${Math.round((successfulSessions / (totalDurationMs / 1000)))} completed interviews/sec)`);
  console.log(`Session Success Rate: ${((successfulSessions / concurrency) * 100).toFixed(2)}% (${successfulSessions}/${concurrency} full interviews completed)`);
  console.log(`Turn Latency:         P50=${percentiles.p50}ms | P95=${percentiles.p95}ms | P99=${percentiles.p99}ms | Avg=${percentiles.avg}ms | Max=${percentiles.max}ms`);

  const mem = process.memoryUsage();
  console.log(`Memory Footprint:     RSS=${Math.round(mem.rss / 1024 / 1024)}MB | Heap=${Math.round(mem.heapUsed / 1024 / 1024)}MB`);

  return {
    concurrency,
    totalOps,
    durationMs: totalDurationMs,
    successfulSessions,
    sessionSuccessRate: ((successfulSessions / concurrency) * 100).toFixed(2),
    rps,
    percentiles,
    rssMb: Math.round(mem.rss / 1024 / 1024),
    heapMb: Math.round(mem.heapUsed / 1024 / 1024)
  };
}

async function main() {
  console.log('Starting AI Interview Load Test Server on port', PORT);
  const server = http.createServer(app);
  await new Promise(r => server.listen(PORT, '127.0.0.1', 2048, r));

  console.log('Generating active authenticated candidate JWT pool...');
  const tokens = [];
  for (let i = 0; i < 25; i++) {
    const user = await memoryStore.createUser({
      name: `AI Interview Candidate ${i + 1}`,
      email: `candidate_sim_${i + 1}_${Date.now()}@interview.ai`,
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

  // STAGE 1: 100 Concurrent AI Interviews (400 Operations)
  reports.push(await runConcurrencyStage(100, 'Stage 1 (100 Concurrent Sessions)', tokens));
  await new Promise(r => setTimeout(r, 600));

  // STAGE 2: 250 Concurrent AI Interviews (1,000 Operations)
  reports.push(await runConcurrencyStage(250, 'Stage 2 (250 Concurrent Sessions)', tokens));
  await new Promise(r => setTimeout(r, 800));

  // STAGE 3: 500 Concurrent AI Interviews (2,000 Operations)
  reports.push(await runConcurrencyStage(500, 'Stage 3 (500 Concurrent Sessions)', tokens));
  await new Promise(r => setTimeout(r, 1000));

  // STAGE 4: 1,000 Concurrent AI Interviews (4,000 Operations)
  reports.push(await runConcurrencyStage(1000, 'Stage 4 (1,000 Concurrent Target)', tokens));

  server.close();
  console.log('\n======================================================');
  console.log('ALL AI INTERVIEW CONCURRENCY STAGES COMPLETE.');
  console.log('======================================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('AI Interview Load Test Fatal Error:', err);
  process.exit(1);
});

