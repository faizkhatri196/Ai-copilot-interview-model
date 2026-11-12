import Position from '../models/Position.js';

const defaultPositions = [
  {
    title: 'SDE Intern',
    slug: 'sde-intern',
    category: 'Software Development',
    levels: [{ levelName: 'Intern', typicalYearsExp: '0 years (Student)', coreCompetencies: ['Basic Data Structures', 'Algorithms', 'OOP', 'Problem Solving'] }],
    skillRequirements: {
      mandatory: ['Data Structures & Algorithms', 'C++ / Java / Python / JavaScript', 'Problem Solving'],
      preferred: ['Git', 'Web Basics', 'SQL'],
      fundamentals: ['OOP', 'Basic Time Complexity', 'Memory Management']
    },
    defaultInterviewRounds: [
      { roundIndex: 1, roundName: 'Online Coding Assessment', roundType: 'Online Assessment', durationMinutes: 60 },
      { roundIndex: 2, roundName: 'DSA Problem Solving Round', roundType: 'DSA Coding Interview', durationMinutes: 45 },
      { roundIndex: 3, roundName: 'Resume & Fundamentals Review', roundType: 'Resume-Based Interview', durationMinutes: 30 }
    ],
    keyEvaluationCriteria: [
      { dimension: 'DSA Correctness', weightPercent: 40 },
      { dimension: 'Code Cleanliness', weightPercent: 30 },
      { dimension: 'Communication', weightPercent: 30 }
    ]
  },
  {
    title: 'SDE 1 (Entry Software Engineer)',
    slug: 'sde-1',
    category: 'Software Development',
    levels: [{ levelName: 'SDE 1', typicalYearsExp: '0-2 years', coreCompetencies: ['Intermediate DSA', 'Clean Code', 'Debugging', 'REST APIs', 'Database Basics'] }],
    skillRequirements: {
      mandatory: ['DSA', 'Object-Oriented Design', 'Relational / NoSQL Databases', 'System Fundamentals'],
      preferred: ['Microservices', 'Docker', 'Cloud Basics'],
      fundamentals: ['Operating Systems', 'DBMS', 'Computer Networks']
    },
    defaultInterviewRounds: [
      { roundIndex: 1, roundName: 'Online Assessment', roundType: 'Online Assessment', durationMinutes: 90 },
      { roundIndex: 2, roundName: 'DSA Coding Round 1', roundType: 'DSA Coding Interview', durationMinutes: 60 },
      { roundIndex: 3, roundName: 'Technical Fundamentals & Code Quality', roundType: 'Technical Fundamentals', durationMinutes: 60 },
      { roundIndex: 4, roundName: 'Behavioral & Culture Fit', roundType: 'Behavioral Interview', durationMinutes: 45 }
    ]
  },
  {
    title: 'Senior Software Engineer (SDE 3 / Staff)',
    slug: 'senior-software-engineer',
    category: 'Software Development',
    levels: [{ levelName: 'Senior', typicalYearsExp: '5+ years', coreCompetencies: ['High Scale Distributed Architecture', 'Data Sharding', 'Mentorship', 'Fault Tolerance'] }],
    skillRequirements: {
      mandatory: ['Distributed Systems', 'System Design', 'Event-Driven Architectures', 'Concurrency', 'Reliability Engineering'],
      preferred: ['Kafka', 'Kubernetes', 'Multi-Region Replication'],
      fundamentals: ['CAP Theorem', 'Consensus Algorithms', 'Cache Strategies']
    }
  },
  {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Development',
    levels: [{ levelName: 'Mid', typicalYearsExp: '2-4 years', coreCompetencies: ['Frontend Frameworks', 'API Gateways', 'Database Normalization', 'State Management'] }],
    skillRequirements: {
      mandatory: ['React / Next.js', 'Node.js / Express / Spring', 'PostgreSQL / MongoDB', 'TypeScript', 'REST / GraphQL'],
      preferred: ['Redis', 'Docker', 'Tailwind CSS'],
      fundamentals: ['Web Performance', 'Security (OWASP)', 'HTTP/HTTPS Protocols']
    }
  },
  {
    title: 'AI / Generative AI Engineer',
    slug: 'ai-engineer',
    category: 'AI and Data',
    levels: [{ levelName: 'Mid-Senior', typicalYearsExp: '2-5 years', coreCompetencies: ['LLM Fine-Tuning', 'RAG Pipelines', 'Vector Databases', 'Prompt Engineering'] }],
    skillRequirements: {
      mandatory: ['Python', 'PyTorch / TensorFlow', 'Vector DBs (Pinecone/Milvus)', 'RAG Architectures', 'Embeddings'],
      preferred: ['Model Quantization', 'vLLM', 'FastAPI'],
      fundamentals: ['Transformer Architecture', 'Attention Mechanisms', 'Tokenization']
    }
  },
  {
    title: 'DevOps & Cloud Engineer',
    slug: 'devops-engineer',
    category: 'Infrastructure',
    levels: [{ levelName: 'Mid-Senior', typicalYearsExp: '3-6 years', coreCompetencies: ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Observability'] }],
    skillRequirements: {
      mandatory: ['Linux Internals', 'Docker & Kubernetes', 'Terraform / CloudFormation', 'AWS / GCP / Azure', 'GitHub Actions'],
      preferred: ['ArgoCD', 'Istio Service Mesh', 'Golang / Python scripting'],
      fundamentals: ['Networking (BGP, DNS, VPC)', 'Zero Trust Security', 'Disaster Recovery']
    }
  }
];

export const getPositions = async (req, res) => {
  try {
    const { category } = req.query || {};
    let filter = {};
    if (category) filter.category = category;

    let positions = [];
    try {
      positions = await Promise.race([
        Position.find(filter).sort({ category: 1, title: 1 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
    } catch {}

    if (!positions || positions.length === 0) {
      const filtered = category ? defaultPositions.filter(p => p.category === category) : defaultPositions;
      return res.json(filtered);
    }
    res.json(positions);
  } catch (error) {
    res.json(defaultPositions);
  }
};

export const getPositionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let position = null;
    try {
      position = await Promise.race([
        Position.findOne({ slug: slug.toLowerCase() }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
    } catch {}

    if (!position) {
      const match = defaultPositions.find(p => p.slug === slug.toLowerCase());
      if (match) return res.json(match);
      return res.status(404).json({ message: 'Position profile not found' });
    }
    res.json(position);
  } catch (error) {
    const match = defaultPositions.find(p => p.slug === req.params.slug.toLowerCase());
    if (match) return res.json(match);
    res.status(500).json({ message: error.message });
  }
};
