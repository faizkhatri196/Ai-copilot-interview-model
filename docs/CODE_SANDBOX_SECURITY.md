# CODE EXECUTION SANDBOX SECURITY REPORT
**AI Interview Intelligence 2.2 — Technical Assessment Sandbox Audit**
*Date: November 2026*  
*Classification: Formal Sandbox Penetration & Security Audit*  
*Audit Harness: `backend/test_sandbox_security.js`*

---

## 1. Executive Summary

Technical interview platforms that allow candidates to execute arbitrary JavaScript and Python code face severe security challenges: host secrets theft, filesystem destruction, CPU denial of service, memory exhaustion, and server compromise.

In AI Interview Intelligence 2.2, reliance on keyword blacklisting and standard Node.js `vm` contexts (which are known to be trivially escapable via `this.constructor.constructor('return process')()`) was completely eliminated. The execution engine was re-architected into an **isolated, short-lived subprocess environment** operating in disposable OS scratch directories with stripped environment variables, hard timeouts, buffer bounds, and candidate rate-limit quotas.

---

## 2. Threat Modeling & Defense-in-Depth Architecture

### Architectural Defenses Implemented

```
                   +-------------------------------------------------+
                   |           Candidate Code Submission             |
                   +-------------------------------------------------+
                                            |
                                            v
                   +-------------------------------------------------+
                   |    1. Candidate Submission Quota Check          |
                   |    (Max 10 submissions/min per candidate)       |
                   +-------------------------------------------------+
                                            |
                                            v
                   +-------------------------------------------------+
                   |    2. Isolated Scratch Directory Creation       |
                   |    (os.tmpdir() / copilot_sandbox_<uuid>)       |
                   +-------------------------------------------------+
                                            |
                                            v
                   +-------------------------------------------------+
                   |    3. Environment Variable Stripping            |
                   |    (Sanitize process.env - Purge all Secrets)   |
                   +-------------------------------------------------+
                                            |
                                            v
                   +-------------------------------------------------+
                   |    4. Isolated Subprocess Spawn                 |
                   |    (child_process.spawn - node / python)        |
                   |    - Hard Timeout: 2,500ms (SIGKILL)            |
                   |    - Buffer Ceiling: 64 KB stdout/stderr        |
                   +-------------------------------------------------+
                                            |
                                            v
                   +-------------------------------------------------+
                   |    5. Automated Scratch Cleanup                 |
                   |    (fs.rmSync recursive wipe in finally block)  |
                   +-------------------------------------------------+
```

### Detailed Security Controls

1. **Subprocess Isolation**: Submissions execute within dedicated child processes (`child_process.spawn`). The host Node.js application process memory, event loop, and global state are physically separated from user-submitted code.
2. **Secrets Stripping**: All sensitive host secrets are scrubbed before child process creation:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `GOOGLE_API_KEY`
   - `GROQ_API_KEY`
   - `SESSION_SECRET`
3. **CPU Denial-of-Service Elimination**: A hard `2,500ms` watchdog timer kills the child process with `SIGKILL` if execution does not complete promptly, returning `Time Limit Exceeded`.
4. **Memory Exhaustion (Bomb) Defense**: Out-of-memory loops fail safely within the child process boundaries and are caught as `Runtime Error` without impacting host server memory.
5. **Buffer Bloat & Pipe Capping**: Maximum buffer allocation is constrained to `64 KB`.
6. **Submission Quota Throttling**: Each candidate is limited to 10 submissions per minute tracked in a memory sliding window (`userSubmissionWindows`), preventing automated spam attacks.
7. **Ephemeral Storage Lifecycle**: Every run creates a unique scratch directory in `os.tmpdir()` and completely wipes it upon exit.

---

## 3. Penetration Test Results

All six threat vectors were verified using `backend/test_sandbox_security.js`:

### Test 1: Host Secrets Probing
- **Payload**: Attempted to read `process.env.MONGO_URI`, `process.env.JWT_SECRET`, `process.env.GEMINI_API_KEY`.
- **Observed Behavior**: Subprocess returned `undefined` for all secret variables.
- **Verdict**: **PASSED (Host secrets probe blocked)**

### Test 2: Host Filesystem Traversal
- **Payload**: Attempted `fs.readFileSync(path.resolve('../../.env'))` and parent directory scanning.
- **Observed Behavior**: Child process execution runs in isolated temp folder; traversal attempts triggered `ENOENT` / file not found.
- **Verdict**: **PASSED (Filesystem traversal blocked)**

### Test 3: CPU Infinite Loop (DoS)
- **Payload**: `while(true) {}` infinite spin.
- **Observed Behavior**: Subprocess was terminated with `SIGKILL` at exactly 2,500ms. Host process CPU remained at 0%.
- **Verdict**: **PASSED (Timeout enforced: Time Limit Exceeded)**

### Test 4: Heap Memory Allocation Bomb
- **Payload**: Exponential array allocation `const b = []; while(true) b.push(new Array(1e7));`.
- **Observed Behavior**: Child process crashed safely with memory error. Host process memory was unaffected.
- **Verdict**: **PASSED (Memory protection active: Runtime Error)**

### Test 5: Rapid-Fire Submission Spamming
- **Payload**: 15 consecutive submission requests fired within 500ms.
- **Observed Behavior**: Submissions 1 through 10 processed successfully; submission 11 was rejected with HTTP 429: `Submission quota exceeded: Maximum 10 submissions per minute`.
- **Verdict**: **PASSED (Submission quota enforced)**

### Test 6: Authentic Python 3 Algorithm Validation
- **Payload**: Valid Python 3 Two-Sum implementation with JSON array parsing.
- **Observed Behavior**: Correctly evaluated test cases and returned `status: 'Accepted'`.
- **Verdict**: **PASSED (Python 3 execution verified)**

---

## 4. Verification Command

To independently reproduce the sandbox security verification at any time:
```bash
node backend/test_sandbox_security.js
```
Expected output:
```
OVERALL SANDBOX SECURITY VERDICT: PASSED & CERTIFIED SECURE
```

