import CodingChallenge from '../models/CodingChallenge.js';
import { runIsolatedCode } from '../services/codeExecutionService.js';

const seedChallenges = [
  {
    title: 'Two Sum Problem',
    slug: 'two-sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Google', 'Meta'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
    starterTemplates: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def twoSum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []`
    },
    testCases: [
      { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]), isHidden: false },
      { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]), isHidden: false },
      { input: JSON.stringify({ nums: [3, 3], target: 6 }), expectedOutput: JSON.stringify([0, 1]), isHidden: true }
    ],
    optimalComplexity: { time: 'O(n)', space: 'O(n)' }
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating',
    topic: 'Sliding Window',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Microsoft', 'Uber'],
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    starterTemplates: {
      javascript: `function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let start = 0;\n  const charMap = new Map();\n  for (let end = 0; end < s.length; end++) {\n    if (charMap.has(s[end])) {\n      start = Math.max(start, charMap.get(s[end]) + 1);\n    }\n    charMap.set(s[end], end);\n    maxLength = Math.max(maxLength, end - start + 1);\n  }\n  return maxLength;\n}`
    },
    testCases: [
      { input: JSON.stringify({ s: "abcabcbb" }), expectedOutput: "3", isHidden: false },
      { input: JSON.stringify({ s: "bbbbb" }), expectedOutput: "1", isHidden: false }
    ],
    optimalComplexity: { time: 'O(n)', space: 'O(min(m, n))' }
  }
];

export const getChallenges = async (req, res) => {
  try {
    const { topic, difficulty } = req.query || {};
    let filter = {};
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;

    let challenges = [];
    try {
      challenges = await Promise.race([
        CodingChallenge.find(filter).select('-testCases.isHidden'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
    } catch {}

    if (!challenges || challenges.length === 0) {
      let filtered = seedChallenges;
      if (topic) filtered = filtered.filter(c => c.topic === topic);
      if (difficulty) filtered = filtered.filter(c => c.difficulty === difficulty);
      return res.json(filtered);
    }
    res.json(challenges);
  } catch (error) {
    res.json(seedChallenges);
  }
};

export const getChallengeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let challenge = null;
    try {
      challenge = await Promise.race([
        CodingChallenge.findOne({ slug }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
    } catch {}

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
    try {
      challenge = await CodingChallenge.findOne({ slug });
    } catch {}
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
      timeLimitMs: challenge.timeLimitMs || 2000,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
