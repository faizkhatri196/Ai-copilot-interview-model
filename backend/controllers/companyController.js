import Company from '../models/Company.js';
import { researchCompanyIntelligence } from '../services/aiService.js';

const defaultCompanies = [
  { name: 'Google', slug: 'google', domain: 'google.com', industry: 'Cloud & Search', description: 'Global technology leader in search, cloud platforms, and AI research.' },
  { name: 'Amazon', slug: 'amazon', domain: 'amazon.com', industry: 'E-commerce & Cloud', description: 'Premier cloud and logistics enterprise with high ownership and leadership principles.' },
  { name: 'Microsoft', slug: 'microsoft', domain: 'microsoft.com', industry: 'Enterprise Software', description: 'Global software pioneer in enterprise systems, operating systems, and Azure cloud.' },
  { name: 'Meta', slug: 'meta', domain: 'meta.com', industry: 'Social Technology', description: 'Global leader in social infrastructure, open source AI, and large-scale web services.' },
  { name: 'Apple', slug: 'apple', domain: 'apple.com', industry: 'Consumer Tech', description: 'World leader in operating systems, consumer hardware, and software integration.' },
  { name: 'Netflix', slug: 'netflix', domain: 'netflix.com', industry: 'Streaming Media', description: 'Pioneer in global content streaming and high-resiliency microservices.' },
  { name: 'Uber', slug: 'uber', domain: 'uber.com', industry: 'Mobility & Logistics', description: 'Pioneer in distributed real-time dispatch systems and dynamic pricing engines.' },
  { name: 'Atlassian', slug: 'atlassian', domain: 'atlassian.com', industry: 'DevOps Tools', description: 'Premier enterprise collaboration and developer tooling suite.' },
  { name: 'Salesforce', slug: 'salesforce', domain: 'salesforce.com', industry: 'Enterprise CRM', description: 'Cloud-first CRM, multi-tenant databases, and enterprise applications.' },
  { name: 'Adobe', slug: 'adobe', domain: 'adobe.com', industry: 'Creative Cloud', description: 'Creative software, digital media solutions, and web document services.' },
];

export const getCompanies = async (req, res) => {
  try {
    const { query } = req.query || {};
    let filter = {};
    if (query) {
      filter = { name: { $regex: query, $options: 'i' } };
    }
    
    // With 2-second timeout to prevent indefinite buffering when offline
    const companies = await Promise.race([
      Company.find(filter).sort({ name: 1 }).limit(30),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
    ]);

    if (!companies || companies.length === 0) {
      return res.json(defaultCompanies);
    }

    res.json(companies);
  } catch (error) {
    // If DB is offline or buffering, return standard premier catalog
    res.json(defaultCompanies);
  }
};

export const getCompanyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let company = null;

    try {
      company = await Promise.race([
        Company.findOne({ slug: slug.toLowerCase() }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
    } catch {}

    if (!company) {
      const formattedName = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const research = await researchCompanyIntelligence(formattedName);

      const profile = {
        name: research.company || formattedName,
        slug: slug.toLowerCase(),
        domain: `${slug}.com`,
        description: research.overview,
        cultureSummary: research.cultureSummary,
        leadershipPrinciples: research.leadershipPrinciples,
        techStack: research.techStack,
        hiringLocations: research.hiringLocations,
        research: {
          overview: research.overview,
          interviewStages: research.stages,
          reportedTopics: research.reportedTopics,
          sources: research.sources,
          lastChecked: new Date(),
        },
      };

      try {
        company = await Company.create(profile);
      } catch {
        company = profile;
      }
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshCompanyResearch = async (req, res) => {
  try {
    const { slug } = req.params;
    let companyName = slug;
    try {
      const found = await Company.findOne({ slug: slug.toLowerCase() });
      if (found) companyName = found.name;
    } catch {}

    const research = await researchCompanyIntelligence(companyName);
    const profile = {
      name: companyName,
      slug: slug.toLowerCase(),
      description: research.overview,
      cultureSummary: research.cultureSummary,
      leadershipPrinciples: research.leadershipPrinciples,
      techStack: research.techStack,
      hiringLocations: research.hiringLocations,
      research: {
        overview: research.overview,
        interviewStages: research.stages,
        reportedTopics: research.reportedTopics,
        sources: research.sources,
        lastChecked: new Date(),
      },
    };

    try {
      const updated = await Company.findOneAndUpdate(
        { slug: slug.toLowerCase() },
        profile,
        { upsert: true, new: true }
      );
      return res.json(updated);
    } catch {
      return res.json(profile);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
