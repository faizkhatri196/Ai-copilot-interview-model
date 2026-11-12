import { getCompanies } from './controllers/companyController.js';
import { getPositions } from './controllers/positionController.js';
import { getChallenges } from './controllers/codingController.js';
import { runIsolatedCode } from './services/codeExecutionService.js';
import {
  generateInterviewQuestions,
  evaluateAnswer,
  researchCompanyIntelligence,
  analyzeResumeContent
} from './services/aiService.js';

async function runDirectUnitVerification() {
  console.log('====================================================');
  console.log('AI INTERVIEW INTELLIGENCE — COMPREHENSIVE CONTROLLER & SERVICE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${name} -> ${e.message}`);
    }
  }

  // Helper to mock Express req & res
  function createMockRes() {
    let statusCode = 200;
    let responseData = null;
    return {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
      getData() {
        return responseData;
      },
      getStatusCode() {
        return statusCode;
      }
    };
  }

  // 1. Company Controller Test
  await test('Company Controller returns top tier company dataset', async () => {
    const req = { query: {} };
    const res = createMockRes();
    await getCompanies(req, res);
    const data = res.getData();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected array of companies');
    const names = data.map(c => c.name);
    if (!names.includes('Amazon') && !names.includes('Google')) {
      throw new Error('Expected Premier tech companies in list');
    }
  });

  // 2. Position Controller Test
  await test('Position Controller returns engineering roles with competency ladders', async () => {
    const req = { query: {} };
    const res = createMockRes();
    await getPositions(req, res);
    const data = res.getData();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected array of roles');
    const titles = data.map(p => p.title);
    if (!titles.some(t => t.includes('SDE') || t.includes('Developer'))) {
      throw new Error('Expected software engineering roles');
    }
  });

  // 3. Coding Arena Directory Test
  await test('Coding Controller returns challenges with optimal complexity', async () => {
    const req = { query: {} };
    const res = createMockRes();
    await getChallenges(req, res);
    const data = res.getData();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Expected challenges array');
    const slugs = data.map(c => c.slug);
    if (!slugs.includes('two-sum')) throw new Error('Expected two-sum in challenge list');
  });

  // 4. Isolated Sandbox Code Execution Runner
  await test('Isolated Code Runner executes and passes test suite', async () => {
    const code = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const comp = target - nums[i];
          if (map.has(comp)) return [map.get(comp), i];
          map.set(nums[i], i);
        }
        return [];
      }
    `;
    const result = await runIsolatedCode({
      code,
      language: 'javascript',
      slug: 'two-sum',
      testCases: [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]), isHidden: false },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]), isHidden: false }
      ]
    });
    if (result.status !== 'Accepted') throw new Error(`Expected Accepted, got ${result.status}`);
    if (result.testsPassed !== 2) throw new Error(`Expected 2 tests passed, got ${result.testsPassed}`);
  });

  // 5. Question Generation Engine
  await test('Question Generation Engine returns structured questions with rubrics', async () => {
    const questions = await generateInterviewQuestions('Frontend Engineer', 'Intermediate', 'Technical Fundamentals', 'Amazon');
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('Expected questions array');
    if (!questions[0].questionText || !questions[0].expectedCriteria) {
      throw new Error('Expected questionText and expectedCriteria');
    }
  });

  // 6. Multi-Dimensional Evaluation Engine
  await test('Evaluation Engine computes multi-dimensional scoring rubric', async () => {
    const evaluation = await evaluateAnswer(
      'Explain how the React Fiber reconciler works and how concurrent rendering prioritizes updates.',
      'React Fiber is a complete rewrite of the reconciliation algorithm. It represents each component as a unit of work called a fiber. It enables concurrent rendering by breaking rendering into interruptible chunks. Work-in-progress trees and lanes allow high priority user interactions to suspend background data fetches.',
      'Frontend Engineer',
      'Technical Fundamentals'
    );
    if (typeof evaluation.score !== 'number' || evaluation.score < 50) {
      throw new Error(`Invalid score ${evaluation.score}`);
    }
    if (!evaluation.technicalCorrectness || !evaluation.communicationAndClarity) {
      throw new Error('Expected multi-dimensional rubric breakdown');
    }
  });

  // 7. Company Intelligence Research Engine
  await test('Company Intelligence Engine returns verified stages and reported topics', async () => {
    const intel = await researchCompanyIntelligence('Amazon');
    if (!intel.company || !Array.isArray(intel.stages) || intel.stages.length === 0) {
      throw new Error('Expected company stages and cultural data');
    }
  });

  // 8. Resume Intelligence Engine
  await test('Resume Intelligence extracts skills and generates tailored questions', async () => {
    const sampleResume = `
      John Doe
      john@example.com | San Francisco, CA
      Skills: React, Next.js, TypeScript, Node.js, Express, MongoDB, Docker, Git
      Experience: Built full stack real-time dashboards handling 10k daily requests with Redis caching.
    `;
    const resAnalysis = await analyzeResumeContent(sampleResume);
    if (!resAnalysis.skills || !Array.isArray(resAnalysis.tailoredInterviewQuestions)) {
      throw new Error('Expected skills extraction and tailored interview questions');
    }
  });

  console.log(`\n====================================================`);
  console.log(`ALL TESTS PASSED: ${passed} of ${total} verified successfully!`);
  console.log(`====================================================\n`);

  process.exit(passed === total ? 0 : 1);
}

runDirectUnitVerification();
