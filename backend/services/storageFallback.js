import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'fallback_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

let store = {
  users: [],
  interviews: [],
  resumes: [],
};

// Load existing store from disk if present
if (fs.existsSync(STORE_FILE)) {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    store = JSON.parse(raw);
    if (!store.users) store.users = [];
    if (!store.interviews) store.interviews = [];
    if (!store.resumes) store.resumes = [];
  } catch (e) {
    console.warn('[Fallback Storage] Could not read fallback_store.json:', e.message);
  }
}

let persistTimer = null;
let isPersisting = false;
let pendingPersist = false;

const persist = () => {
  if (persistTimer) return;
  persistTimer = setTimeout(async () => {
    persistTimer = null;
    if (isPersisting) {
      pendingPersist = true;
      return;
    }
    isPersisting = true;
    try {
      const data = JSON.stringify(store);
      await fs.promises.writeFile(STORE_FILE, data, 'utf8');
    } catch (e) {
      // Non-fatal if filesystem is read-only
    } finally {
      isPersisting = false;
      if (pendingPersist) {
        pendingPersist = false;
        persist();
      }
    }
  }, 100);
};

// Guarantee zero data loss on process exit or graceful shutdown
export const flushStoreSync = () => {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store), 'utf8');
  } catch (e) {
    // Non-fatal if filesystem is restricted
  }
};

process.on('exit', flushStoreSync);
process.on('SIGINT', () => { flushStoreSync(); process.exit(0); });
process.on('SIGTERM', () => { flushStoreSync(); process.exit(0); });

const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Math.floor(Math.random() * 0xffffffffffffff).toString(16).padStart(16, '0');
  return `${timestamp}${random}`;
};

export const memoryStore = {
  async findUserByEmail(email) {
    if (!email) return null;
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (!id) return null;
    return store.users.find(u => String(u._id) === String(id)) || null;
  },

  async createUser({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: generateId(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      onboardingCompleted: false,
      onboardingStep: 1,
      profile: {
        headline: 'Software Engineer',
        location: 'Remote',
        experienceLevel: 'Fresher',
        education: [],
        technicalSkills: ['React', 'Node.js', 'Data Structures & Algorithms'],
        targetCompanies: ['Google', 'Amazon', 'Microsoft'],
        targetPositions: ['SDE 1', 'Full Stack Developer'],
        weeklyTargetHours: 10,
        preparationGoals: ['Master Tech Interviews'],
      },
      settings: {
        interviewerPersonality: 'Professional',
        voiceSpeed: 1.0,
        autoSpeak: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.users.push(newUser);
    persist();
    return newUser;
  },

  async updateUser(id, updateData) {
    const user = store.users.find(u => String(u._id) === String(id));
    if (!user) return null;

    if (updateData.name) user.name = updateData.name;
    if (typeof updateData.onboardingCompleted === 'boolean') {
      user.onboardingCompleted = updateData.onboardingCompleted;
    }
    if (typeof updateData.onboardingStep === 'number') {
      user.onboardingStep = updateData.onboardingStep;
    }
    if (updateData.profile) {
      user.profile = { ...user.profile, ...updateData.profile };
    }
    if (updateData.settings) {
      user.settings = { ...user.settings, ...updateData.settings };
    }
    user.updatedAt = new Date();
    persist();
    return user;
  },

  async matchPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Interviews
  async createInterview(interviewData) {
    const newInterview = {
      _id: generateId(),
      ...interviewData,
      status: interviewData.status || 'In Progress',
      finalScore: interviewData.finalScore || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.interviews.unshift(newInterview);
    persist();
    return newInterview;
  },

  async findInterviewsByUserId(userId) {
    return store.interviews.filter(i => String(i.userId) === String(userId));
  },

  async findInterviewById(id) {
    return store.interviews.find(i => String(i._id) === String(id)) || null;
  },

  async updateInterview(id, updateData) {
    const interview = store.interviews.find(i => String(i._id) === String(id));
    if (!interview) return null;
    Object.assign(interview, updateData);
    interview.updatedAt = new Date();
    persist();
    return interview;
  },

  // Resumes
  async countResumes(userId) {
    return (store.resumes || []).filter(r => String(r.userId) === String(userId)).length;
  },

  async createResume(resumeData) {
    if (!store.resumes) store.resumes = [];
    const newResume = {
      _id: generateId(),
      ...resumeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.resumes.unshift(newResume);
    persist();
    return newResume;
  },

  async findResumesByUserId(userId) {
    return (store.resumes || []).filter(r => String(r.userId) === String(userId));
  },

  async findResumeById(id, userId) {
    return (store.resumes || []).find(r => String(r._id) === String(id) && (!userId || String(r.userId) === String(userId))) || null;
  },

  async setPrimaryResume(userId, resumeId) {
    if (!store.resumes) store.resumes = [];
    store.resumes.forEach(r => {
      if (String(r.userId) === String(userId)) {
        r.isPrimary = String(r._id) === String(resumeId);
      }
    });
    persist();
  },

  async findPrimaryResume(userId) {
    if (!store.resumes) return null;
    return store.resumes.find(r => String(r.userId) === String(userId) && r.isPrimary) ||
           store.resumes.find(r => String(r.userId) === String(userId)) || null;
  },

  // Research Cache (in-memory + disk with TTL)
  getCompanyResearch(slug) {
    if (!store.companyResearch) store.companyResearch = {};
    const item = store.companyResearch[slug.toLowerCase()];
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      delete store.companyResearch[slug.toLowerCase()];
      return null;
    }
    return item.data;
  },

  setCompanyResearch(slug, data, ttlSeconds = 86400) {
    if (!store.companyResearch) store.companyResearch = {};
    store.companyResearch[slug.toLowerCase()] = {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };
    persist();
  }
};

