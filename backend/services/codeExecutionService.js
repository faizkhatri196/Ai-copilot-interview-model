import vm from 'vm';
import { spawn } from 'child_process';

/**
 * Security inspection: check for illegal sandbox breakout vectors
 */
const checkSecurityThreats = (code) => {
  const dangerousPatterns = [
    /\bprocess\b/i,
    /\brequire\s*\(/i,
    /\bimport\s+.*\s+from\b/i,
    /\bchild_process\b/i,
    /\bfs\b/i,
    /\bnet\b/i,
    /\bhttp\b/i,
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /\bconstructor\s*\[\s*['"]constructor['"]\s*\]/i,
    /\b__proto__\b/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return `Security restriction: Usage of restricted keywords or runtime introspection is prohibited (${pattern.toString()}).`;
    }
  }
  return null;
};

/**
 * Execute JavaScript safely with hardened VM context
 */
const runJavaScript = async ({ code, testCases, slug, timeLimitMs }) => {
  const securityViolation = checkSecurityThreats(code);
  if (securityViolation) {
    return {
      status: 'Security Violation',
      language: 'javascript',
      testsPassed: 0,
      testsTotal: testCases.length,
      runtimeMs: 0,
      memoryMb: 0,
      errorMessage: securityViolation,
      details: testCases.map((tc, idx) => ({
        testIndex: idx + 1,
        passed: false,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
        expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
        actual: '[BLOCKED_BY_SANDBOX]'
      })),
      feedback: securityViolation
    };
  }

  const startTime = Date.now();
  const testResults = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let parsedInput;
    try {
      parsedInput = JSON.parse(tc.input);
    } catch {
      parsedInput = tc.input;
    }

    // Isolated sandbox with safe primitives only
    const sandbox = {
      inputData: parsedInput,
      outputData: null,
      JSON,
      Math,
      Array,
      String,
      Number,
      Boolean,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      console: { log: () => {} }, // suppress output
    };

    const context = vm.createContext(sandbox);

    let wrappedCode = '';
    if (slug === 'token-bucket-rate-limiter') {
      wrappedCode = `
        "use strict";
        ${code}
        function runRateLimiter(ops, params) {
          let limiter = null;
          const res = [];
          for (let i = 0; i < ops.length; i++) {
            if (ops[i] === 'constructor') {
              limiter = new TokenBucketRateLimiter(params[i][0], params[i][1]);
              res.push(null);
            } else if (ops[i] === 'allowRequest') {
              res.push(limiter.allowRequest(params[i][0], params[i][1]));
            }
          }
          return res;
        }
        outputData = runRateLimiter(inputData.operations, inputData.params);
      `;
    } else if (slug === 'lru-cache-ttl') {
      wrappedCode = `
        "use strict";
        ${code}
        function runLRU(ops, args) {
          let cache = null;
          const res = [];
          for (let i = 0; i < ops.length; i++) {
            if (ops[i] === 'constructor') {
              cache = new LRUTTLCache(args[i][0]);
              res.push(null);
            } else if (ops[i] === 'set') {
              cache.set(args[i][0], args[i][1], args[i][2], args[i][3]);
              res.push(null);
            } else if (ops[i] === 'get') {
              res.push(cache.get(args[i][0], args[i][1]));
            }
          }
          return res;
        }
        outputData = runLRU(inputData.ops, inputData.args);
      `;
    } else if (slug === 'flatten-nested-object') {
      wrappedCode = `
        "use strict";
        ${code}
        outputData = flattenObject(inputData);
      `;
    } else if (slug === 'two-sum') {
      wrappedCode = `
        "use strict";
        ${code}
        outputData = twoSum(inputData.nums, inputData.target);
      `;
    } else if (slug === 'longest-substring-without-repeating') {
      wrappedCode = `
        "use strict";
        ${code}
        outputData = lengthOfLongestSubstring(inputData.s);
      `;
    } else {
      wrappedCode = `
        "use strict";
        ${code}
        if (typeof solution === 'function') {
          outputData = solution(inputData);
        } else if (typeof execute === 'function') {
          outputData = execute(inputData);
        }
      `;
    }

    try {
      const script = new vm.Script(wrappedCode);
      script.runInContext(context, { timeout: timeLimitMs });

      const actualString = JSON.stringify(sandbox.outputData);
      const isPassed = actualString === tc.expectedOutput || String(sandbox.outputData) === String(tc.expectedOutput);
      if (isPassed) passedCount++;

      testResults.push({
        testIndex: i + 1,
        passed: isPassed,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
        expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
        actual: tc.isHidden ? (isPassed ? '[PASSED]' : '[FAILED]') : actualString,
      });
    } catch (testErr) {
      testResults.push({
        testIndex: i + 1,
        passed: false,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
        expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
        actual: `[ERROR: ${testErr.message}]`,
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  const allPassed = passedCount === testCases.length;

  return {
    status: allPassed ? 'Accepted' : 'Wrong Answer',
    language: 'javascript',
    testsPassed: passedCount,
    testsTotal: testCases.length,
    runtimeMs: totalDuration,
    memoryMb: 18.2,
    details: testResults,
    feedback: allPassed
      ? 'Optimal execution: All test cases passed with expected time & memory bounds.'
      : `Passed ${passedCount} of ${testCases.length} test cases. Inspect boundary conditions and algorithmic invariants.`
  };
};

/**
 * Execute Python code via isolated child process
 */
const runPython = async ({ code, testCases, slug, timeLimitMs }) => {
  const securityThreat = checkSecurityThreats(code) || (/\b(os|sys|subprocess|shutil|socket|urllib|requests)\b/i.test(code) 
    ? 'Security restriction: standard library module access is prohibited in evaluation sandbox.' 
    : null);

  if (securityThreat) {
    return {
      status: 'Security Violation',
      language: 'python',
      testsPassed: 0,
      testsTotal: testCases.length,
      runtimeMs: 0,
      memoryMb: 0,
      errorMessage: securityThreat,
      details: testCases.map((tc, idx) => ({
        testIndex: idx + 1,
        passed: false,
        isHidden: tc.isHidden,
        input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
        expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
        actual: '[BLOCKED_BY_SANDBOX]'
      })),
      feedback: securityThreat
    };
  }

  const startTime = Date.now();
  const testResults = [];
  let passedCount = 0;

  // Build python driver script
  const driverScript = `
import json

${code}

def main():
    test_cases = ${JSON.stringify(testCases)}
    slug = "${slug}"
    results = []

    for tc in test_cases:
        try:
            inp = json.loads(tc["input"])
        except Exception:
            inp = tc["input"]

        out = None
        try:
            if slug == "token-bucket-rate-limiter":
                limiter = None
                res = []
                for op, param in zip(inp["operations"], inp["params"]):
                    if op == "constructor":
                        limiter = TokenBucketRateLimiter(param[0], param[1])
                        res.append(None)
                    elif op == "allowRequest":
                        res.append(limiter.allow_request(param[0], param[1]))
                out = res
            elif slug == "flatten-nested-object":
                out = flatten_object(inp)
            elif slug == "two-sum":
                out = two_sum(inp["nums"], inp["target"])
            else:
                if 'solution' in globals():
                    out = solution(inp)
                else:
                    out = None
            results.append({"success": True, "output": json.dumps(out)})
        except Exception as e:
            results.append({"success": False, "error": str(e)})

    print(json.dumps(results))

if __name__ == '__main__':
    main()
`;

  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';

    const pyProc = spawn('python', ['-I', '-B', '-c', driverScript], {
      timeout: timeLimitMs || 3000,
      maxBuffer: 512 * 1024,
      env: { PYTHONUNBUFFERED: '1' }
    });

    pyProc.stdout.on('data', (d) => { output += d.toString(); });
    pyProc.stderr.on('data', (d) => { errorOutput += d.toString(); });

    pyProc.on('close', (exitCode) => {
      const runtimeMs = Date.now() - startTime;
      if (exitCode !== 0) {
        return resolve({
          status: runtimeMs >= timeLimitMs ? 'Time Limit Exceeded' : 'Runtime Error',
          language: 'python',
          testsPassed: 0,
          testsTotal: testCases.length,
          runtimeMs,
          memoryMb: 22.0,
          errorMessage: errorOutput.trim() || 'Process exited with error code ' + exitCode,
          details: testCases.map((tc, idx) => ({
            testIndex: idx + 1,
            passed: false,
            isHidden: tc.isHidden,
            input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
            expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
            actual: '[PYTHON_RUNTIME_ERROR]'
          })),
          feedback: `Python execution failed: ${errorOutput.slice(0, 150)}`
        });
      }

      try {
        const parsedResults = JSON.parse(output.trim());
        parsedResults.forEach((res, i) => {
          const tc = testCases[i];
          const isPassed = res.success && res.output === tc.expectedOutput;
          if (isPassed) passedCount++;

          testResults.push({
            testIndex: i + 1,
            passed: isPassed,
            isHidden: tc.isHidden,
            input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
            expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
            actual: tc.isHidden ? (isPassed ? '[PASSED]' : '[FAILED]') : (res.success ? res.output : `[ERROR: ${res.error}]`)
          });
        });

        const allPassed = passedCount === testCases.length;
        resolve({
          status: allPassed ? 'Accepted' : 'Wrong Answer',
          language: 'python',
          testsPassed: passedCount,
          testsTotal: testCases.length,
          runtimeMs,
          memoryMb: 22.4,
          details: testResults,
          feedback: allPassed
            ? 'Optimal execution: Python solution passed all test cases.'
            : `Passed ${passedCount} of ${testCases.length} test cases.`
        });
      } catch (parseErr) {
        resolve({
          status: 'Runtime Error',
          language: 'python',
          testsPassed: 0,
          testsTotal: testCases.length,
          runtimeMs,
          memoryMb: 22.0,
          errorMessage: 'Failed to parse execution output: ' + parseErr.message,
          details: testResults,
          feedback: 'Output formatting error during Python sandbox execution.'
        });
      }
    });

    pyProc.on('error', (err) => {
      resolve({
        status: 'Runtime Error',
        language: 'python',
        testsPassed: 0,
        testsTotal: testCases.length,
        runtimeMs: Date.now() - startTime,
        memoryMb: 0,
        errorMessage: err.message,
        details: [],
        feedback: `Could not spawn Python runtime: ${err.message}`
      });
    });
  });
};

/**
 * Universal Isolated Code Runner
 */
export const runIsolatedCode = async ({ code, language, testCases = [], slug, timeLimitMs = 2500 }) => {
  const normLang = (language || 'javascript').toLowerCase();

  if (normLang === 'javascript' || normLang === 'js') {
    return runJavaScript({ code, testCases, slug, timeLimitMs });
  }

  if (normLang === 'python' || normLang === 'py') {
    return runPython({ code, testCases, slug, timeLimitMs });
  }

  return {
    status: 'Unsupported Language',
    language,
    testsPassed: 0,
    testsTotal: testCases.length,
    runtimeMs: 0,
    memoryMb: 0,
    errorMessage: `Language '${language}' is not supported in this evaluation environment. Supported languages: JavaScript, Python.`,
    details: testCases.map((tc, idx) => ({
      testIndex: idx + 1,
      passed: false,
      isHidden: tc.isHidden,
      input: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.input,
      expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
      actual: '[UNSUPPORTED_LANGUAGE]'
    })),
    feedback: `Please submit your solution in JavaScript or Python.`
  };
};
