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

const persist = () => {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal if filesystem is read-only
  }
};

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
  }
};

