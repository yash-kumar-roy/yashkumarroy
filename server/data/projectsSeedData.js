export const seedProjects = [
  {
    slug: 'telecom-churn-prediction',
    result: 'ROC-AUC 0.89 on unseen data',
    title: 'Telecom Churn Prediction',
    category: 'Data Science',
    description: 'Predicts which customers are about to leave, with a tool to test what-if scenarios.',
    details: 'Built with time-based cross-validation, SMOTE for handling class imbalance, and calibrated probability modeling. Enables retention teams to simulate churn risks, identify primary churn drivers, and deploy proactive retention incentives before customer turnover occurs.',
    stack: ['Python', 'scikit-learn', 'Streamlit', 'Pandas', 'SMOTE', 'NumPy'],
    liveUrl: 'https://telecomechurnprediction-7prokjhha4796ddws2pcxj.streamlit.app/',
    githubUrl: 'https://github.com/yash-kumar-roy/Telecome_churn_prediction',
    demoType: 'external',
    featured: true,
    order: 1,
    icon: '🤖',
    highlights: [
      'Achieved ROC-AUC of 0.89 on holdout validation data',
      'Addressed class imbalance using SMOTE and threshold tuning',
      'Interactive Streamlit UI for customer success teams to simulate what-if scenarios'
    ]
  },
  {
    slug: 'medical-cost-prediction',
    result: 'Every prediction is explained with SHAP',
    title: 'Medical Cost Prediction',
    category: 'Data Science',
    description: 'Estimates insurance costs and shows exactly which factors drive each estimate.',
    details: 'Comprehensive regression modeling pipeline with thorough feature engineering, cross-validation, and SHAP (SHapley Additive exPlanations) value decomposition. Helps insurers and patients pinpoint exact cost drivers like BMI, smoking status, age, and regional trends.',
    stack: ['Python', 'XGBoost', 'SHAP', 'Streamlit', 'scikit-learn', 'Matplotlib'],
    liveUrl: 'https://yash-kumar-roy-medical-cost-prediction-app-aht1f2.streamlit.app/',
    githubUrl: 'https://github.com/yash-kumar-roy/Medical_Cost_Prediction',
    demoType: 'external',
    featured: true,
    order: 2,
    icon: '📈',
    highlights: [
      'Gradient boosting regression with fine-tuned hyperparameters',
      'SHAP beeswarm and dependence plots explaining every single prediction',
      'Live deployed Streamlit dashboard for real-time cost estimation'
    ]
  },
  {
    slug: 'style-transfer-gan',
    result: 'Stable training with no mode collapse',
    title: 'Style Transfer GAN',
    category: 'Deep Learning',
    description: 'Turns photos into paintings using a neural network trained on artwork.',
    details: 'Implements custom WGAN-GP architecture combined with instance normalization and perceptual loss functions to stabilize adversarial training and eliminate mode collapse, translating photographic scenes into distinct artistic styles with visual consistency.',
    stack: ['TensorFlow', 'Keras', 'Python', 'WGAN-GP', 'Computer Vision'],
    liveUrl: 'https://github.com/yash-kumar-roy/Style_Transfer_GAN',
    githubUrl: 'https://github.com/yash-kumar-roy/Style_Transfer_GAN',
    demoType: 'code',
    featured: true,
    order: 3,
    icon: '🧠',
    highlights: [
      'Wasserstein loss with Gradient Penalty for stable generator/discriminator convergence',
      'Instance normalization preserving high-frequency image textures',
      'Trained on diverse cross-domain artistic datasets'
    ]
  },
  {
    slug: 'sudoku-game',
    title: 'Sudoku Game & Solver',
    category: 'Games',
    description: 'Play Sudoku at three difficulty levels, or let the solver finish the board for you.',
    details: 'An interactive web Sudoku game featuring dynamic board generation, error detection, conflict highlighting, note-taking mode, and a responsive keyboard/numpad interface for both desktop and mobile play.',
    stack: ['JavaScript', 'CSS Grid', 'HTML5', 'Algorithms'],
    liveUrl: '/demos/sudoku/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Sudoku',
    demoType: 'interactive',
    featured: true,
    order: 4,
    icon: '🔢',
    highlights: [
      'Backtracking solver algorithm with instant verification',
      'Multiple difficulty presets (Easy, Medium, Hard)',
      'Clean keyboard controls and mobile friendly numpad'
    ]
  },
  {
    slug: 'online-whiteboard',
    title: 'Online Whiteboard',
    category: 'Creative',
    description: 'Sketch freehand or draw shapes, pick colours, and save your drawing as an image.',
    details: 'A canvas-based sketching workspace featuring pen, highlighter, line, rectangle, and circle tools. Supports customizable stroke weights, color palettes, undo/redo states, eraser, and direct PNG snapshot downloads.',
    stack: ['JavaScript', 'HTML5 Canvas API', 'CSS3', 'Blob Export'],
    liveUrl: '/demos/online-whiteboard/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Online%20Whiteboard',
    demoType: 'interactive',
    featured: true,
    order: 5,
    icon: '🎨',
    highlights: [
      'Fast 60 FPS HTML5 canvas drawing engine',
      'Geometric shapes, brushes, custom palette, and eraser',
      'Instant PNG canvas export'
    ]
  },
  {
    slug: 'transcribeit-app',
    title: 'TranscribeIt Audio/Video Workspace',
    category: 'AI & Utility',
    description: 'Turns audio or video into text with Whisper, right in your browser, with timestamps and export.',
    details: 'Allows content creators, researchers, and students to load video or audio files, control playback speed with keyboard shortcuts, draft synchronized transcripts with timestamps, and download formatted transcriptions.',
    stack: ['JavaScript', 'HTML5 Media API', 'CSS3', 'Web APIs'],
    liveUrl: '/demos/transcribe-app/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Transcribe%20app',
    demoType: 'interactive',
    featured: true,
    order: 6,
    icon: '🎙️',
    highlights: [
      'Synchronized video/audio player with variable speed control',
      'Keyboard shortcuts for pause, play, rewind, and timestamp insertion',
      'Clean text export for subtitles and notes'
    ]
  },
  {
    slug: 'equation-solver-tool',
    title: 'Equation Solver Tool',
    category: 'Web Apps & Tools',
    description: 'Solves linear, quadratic and simultaneous equations step by step.',
    details: 'Parses polynomial equations, computes discriminants and complex roots, displays LaTeX rendered mathematical expressions via MathJax, and explains intermediate algebraic steps clearly.',
    stack: ['JavaScript', 'MathJax', 'HTML5', 'CSS3'],
    liveUrl: '/demos/equation-solver/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Equation%20Solver%20Tool',
    demoType: 'interactive',
    featured: false,
    order: 7,
    icon: '📐',
    highlights: [
      'Solves linear, quadratic, and multi-variable equation systems',
      'Formatted mathematical notation using MathJax',
      'Clear step-by-step root derivation'
    ]
  },
  {
    slug: 'catch-falling-fruits',
    title: 'Catch Falling Fruits Arcade',
    category: 'Games',
    description: 'Move the basket to catch falling fruit. Miss three and the game ends.',
    details: 'Smooth 60 FPS animation loop with progressive speed scaling, multi-fruit spawning algorithms, sound effects, lives tracking, and high score persistence in browser storage.',
    stack: ['JavaScript', 'HTML5 Canvas', 'CSS3', 'Game Physics'],
    liveUrl: '/demos/catch-falling-fruits/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/catch%20falling%20fruits',
    demoType: 'interactive',
    featured: false,
    order: 8,
    icon: '🍎',
    highlights: [
      'Smooth canvas animation loop with keyboard and touch controls',
      'Dynamic collision detection and progressive difficulty curves',
      'Score, lives tracking, and game over states'
    ]
  },
  {
    slug: 'typing-speed-game',
    title: 'Typing Speed Challenge',
    category: 'Games',
    description: 'A typing shooter: type each word to destroy enemies before they reach you.',
    details: 'Tracks keystrokes dynamically, highlights character matches and misses in real time, computes raw and net WPM, and calculates accuracy percentages across varied test paragraphs.',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'DOM Manipulation'],
    liveUrl: '/demos/typing-game/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Typing%20Game',
    demoType: 'interactive',
    featured: false,
    order: 9,
    icon: '⌨️',
    highlights: [
      'Real-time WPM and accuracy calculation',
      'Visual letter-by-letter feedback on typing errors',
      'Multiple test paragraph lengths and restart timer'
    ]
  },
  {
    slug: 'photo-compressor',
    title: 'Photo Compressor Utility',
    category: 'Web Apps & Tools',
    description: 'Shrink and resize images right in your browser. Nothing is uploaded.',
    details: 'Leverages HTML5 Canvas 2D context to re-encode JPEG and PNG images on the client machine. Offers customizable quality sliders, real-time before/after file size comparisons, and instant downloads.',
    stack: ['JavaScript', 'HTML5 Canvas', 'Blob API', 'CSS3'],
    liveUrl: '/demos/photo-compressor/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Photo%20compressor',
    demoType: 'interactive',
    featured: false,
    order: 10,
    icon: '🛠️',
    highlights: [
      '100% private client-side processing without uploading files to any external server',
      'Live compression percentage and byte size comparison',
      'Instant one-click file download'
    ]
  },
  {
    slug: 'micro-habit-tracker',
    title: 'Micro Habit Tracker',
    category: 'Productivity',
    description: 'Track small daily habits and keep your streaks going.',
    details: 'Designed around atomic habits principles. Features lightweight daily check-offs, streak calculation logic, customizable habit tags, and automatic local retention so users never lose progress.',
    stack: ['JavaScript', 'LocalStorage', 'CSS3', 'HTML5'],
    liveUrl: '/demos/micro-habit-tracker/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Micro%20Habit%20Tracker',
    demoType: 'interactive',
    featured: false,
    order: 11,
    icon: '🎯',
    highlights: [
      'Daily habit checklist with streak tracking',
      'Visual progress indicators and habit categories',
      'Persistent LocalStorage saving habits across sessions'
    ]
  },
  {
    slug: 'grok-ui-replica',
    title: 'Grok Homepage UI Clone',
    category: 'UI/UX & Frontend',
    description: 'A responsive recreation of the Grok landing page in a dark theme.',
    details: 'Meticulously crafted typography, micro-interactions, responsive flex/grid layouts, glowing accent gradients, and animated UI elements replicating modern AI application landing experiences.',
    stack: ['JavaScript', 'Modern CSS', 'HTML5', 'Responsive Design'],
    liveUrl: '/demos/grok-home-page/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Grok%20Home%20Page',
    demoType: 'interactive',
    featured: false,
    order: 12,
    icon: '🕳️',
    highlights: [
      'Faithful dark-mode aesthetic with custom futuristic typography',
      'Responsive design adapting across all device viewports',
      'Smooth micro-interactions and hovering states'
    ]
  },
  {
    slug: 'markdown-slides',
    title: 'Markdown → Slides Generator',
    category: 'Productivity',
    description: 'Write Markdown and get a slide deck you can present with the keyboard.',
    details: 'Type Markdown on the left and see interactive, beautifully styled presentation slides on the right. Supports keyboard slide navigation, code blocks, lists, and speaker-friendly presentation mode.',
    stack: ['JavaScript', 'Markdown Parser', 'CSS Transitions', 'HTML5'],
    liveUrl: '/demos/markdown-slides/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/MarkdownSlides',
    demoType: 'interactive',
    featured: false,
    order: 13,
    icon: '📊',
    highlights: [
      'Real-time dual-pane editor with instant slide preview',
      'Keyboard navigation (Arrow keys, Spacebar, Fullscreen)',
      'Exports clean formatted presentations'
    ]
  },
  {
    slug: 'python-quiz-app',
    title: 'Python Knowledge Quiz',
    category: 'EdTech',
    description: 'Ten multiple-choice questions to test your Python basics.',
    details: 'Provides randomized question queues, real-time score calculation, immediate answer explanations, progress indicators, and comprehensive final performance scorecards.',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'Python Curriculum'],
    liveUrl: '/demos/python-quiz/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Python%20quiz',
    demoType: 'interactive',
    featured: false,
    order: 14,
    icon: '🐍',
    highlights: [
      'Comprehensive question bank covering core Python concepts',
      'Instant feedback and explanation for each question',
      'Performance breakdown with score summary'
    ]
  },
  {
    slug: 'employee-timesheet',
    title: 'Employee Timesheet Log',
    category: 'Productivity',
    description: 'Log work hours and breaks, and the totals are calculated for you.',
    details: 'Allows logging clock-in, clock-out, task notes, and automated weekly/daily total hour computation. Useful for freelancers and team member attendance logging.',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'Date APIs'],
    liveUrl: '/demos/time-sheet/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Time%20Sheet',
    demoType: 'interactive',
    featured: false,
    order: 15,
    icon: '📝',
    highlights: [
      'Dynamic shift logging with clock-in and clock-out calculations',
      'Automatic hour totals and overtime calculations',
      'Clean print-friendly table layout'
    ]
  },
  {
    slug: 'family-tree-builder',
    title: 'Family Tree Visualizer',
    category: 'Web Apps & Tools',
    description: 'Add family members and see how everyone is connected across generations.',
    details: 'Custom hierarchy tree layout with parent-child-spouse relationships, dynamic node expansion, profile editing, and clean SVG/CSS connectors.',
    stack: ['JavaScript', 'SVG/CSS', 'DOM Tree API', 'HTML5'],
    liveUrl: '/demos/family-tree/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Family%20Tree',
    demoType: 'interactive',
    featured: false,
    order: 16,
    icon: '🌳',
    highlights: [
      'Interactive visual tree layout with branching relationships',
      'Add, edit, and organize multiple generations',
      'Responsive zooming and panning canvas'
    ]
  },
  {
    slug: 'scientific-calculator',
    title: 'Scientific Calculator',
    category: 'Web Apps & Tools',
    description: 'A scientific calculator with trigonometry, logarithms, powers and a history of results.',
    details: 'Offers standard and scientific modes, bracket nesting, backspace, memory store/recall, and a running tape log of recent evaluations.',
    stack: ['JavaScript', 'Math Engine', 'CSS Grid', 'HTML5'],
    liveUrl: '/demos/calculator/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Calculator',
    demoType: 'interactive',
    featured: false,
    order: 17,
    icon: '🧮',
    highlights: [
      'Trigonometric, logarithmic, exponent, and square root operations',
      'Calculation tape keeping history of past evaluations',
      'Support for keyboard input and on-screen keypad'
    ]
  },
  {
    slug: 'todo-list-app',
    title: 'Minimalist Todo Manager',
    category: 'Productivity',
    description: 'A simple to-do list with filters that remembers your tasks.',
    details: 'Built with attention to fluid micro-interactions, task editing, quick filter toggles (All, Active, Completed), and LocalStorage sync for a seamless daily workflow.',
    stack: ['JavaScript', 'LocalStorage', 'CSS3', 'HTML5'],
    liveUrl: '/demos/todo-list/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/Todo%20list',
    demoType: 'interactive',
    featured: false,
    order: 18,
    icon: '✅',
    highlights: [
      'Instant task creation, edit, completion, and deletion',
      'Filter tabs for All, Active, and Completed tasks',
      'Auto-saves state in browser LocalStorage'
    ]
  },
  {
    slug: 'inventory-manager',
    title: 'Inventory & Stock Search',
    category: 'Web Apps & Tools',
    description: 'Look up stock levels for products in a small store\'s inventory.',
    details: 'Features instant debounce filtering, item tracking, price/SKU organization, and responsive tables for small business inventory tracking.',
    stack: ['Python', 'Flask', 'JavaScript', 'HTML5', 'CSS3'],
    liveUrl: '/demos/inventory-manager/index.html',
    githubUrl: 'https://github.com/yash-kumar-roy/yashkumarroy/tree/main/inventory%20manager',
    demoType: 'interactive',
    featured: false,
    order: 19,
    icon: '📦',
    highlights: [
      'Instant real-time search across product names and SKUs',
      'Category badges and low-stock indicators',
      'Clean tabular management UI'
    ]
  }
];
