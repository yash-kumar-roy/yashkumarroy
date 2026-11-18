// Default profile used when MongoDB has no profile yet (or isn't connected).
// Everything here can be edited from /admin once MongoDB is connected.
export const defaultProfile = {
  key: 'main',
  name: 'Yash Kumar Roy',
  role: 'Data Science Associate & Full-Stack Developer',
  tagline: 'I build machine learning models, and the web apps that put them to work.',
  about: [
    'I take projects from raw data to a finished product. I clean and model the data in Python, test it properly, and build an app people can actually use.',
    'I studied Computer Science, then Data Science and AI. For models I use scikit-learn, XGBoost and TensorFlow. For apps I use React, Node.js, Express and MongoDB.',
    'I care about results you can explain. A churn model only helps if the team can see why a customer might leave and what to do about it.'
  ],
  location: 'India',
  availability: 'Open to data science and full-stack roles',
  email: 'yashkumarroy164@gmail.com',
  avatar: '',
  resumeUrl: '',
  socials: {
    github: 'https://github.com/yash-kumar-roy',
    linkedin: 'https://www.linkedin.com/in/yashkumarroy/',
    kaggle: 'https://www.kaggle.com/yashkumarroy',
    instagram: 'https://www.instagram.com/yashkumarroy'
  },
  heroMetric: {
    value: 0.89,
    label: 'My telecom churn model, scored on unseen data',
    projectSlug: 'telecom-churn-prediction'
  },
  experience: [
    {
      role: 'Data Science Associate',
      org: 'Sequence Surface',
      start: '2025',
      end: 'Present',
      summary: 'Building data pipelines, analyses and ML models that feed product and business decisions.',
      bullets: [],
      tags: ['Python', 'SQL', 'Machine Learning']
    }
  ],
  education: [
    { degree: 'M.S. in Data Science & AI', org: 'Liverpool John Moores University', start: '2024', end: '2026' },
    { degree: 'Executive PG Programme in Data Science & AI', org: 'IIIT Bangalore', start: '2024', end: '2025' },
    { degree: 'B.Tech in Computer Science & Engineering', org: 'Engineering College', start: '2019', end: '2023' }
  ],
  skills: [
    { group: 'Machine learning', items: ['scikit-learn', 'XGBoost', 'TensorFlow', 'Keras', 'SHAP', 'WGAN-GP', 'Feature engineering'] },
    { group: 'Data & analysis', items: ['Python', 'Pandas', 'NumPy', 'SQL', 'Streamlit', 'Matplotlib', 'Seaborn', 'Tableau'] },
    { group: 'Full-stack', items: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'HTML5 Canvas'] },
    { group: 'Tooling', items: ['Git', 'Docker', 'Vite', 'Render', 'Netlify', 'Streamlit Cloud'] }
  ]
};
