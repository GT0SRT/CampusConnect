// No TypeScript imports needed anymore

export const mockAssessmentResponse = {
  questions: [
    {
      id: 1,
      question:
        "Which of the following best describes the primary goal of an Agile software development methodology?",
      options: [
        "To deliver a perfect, fully-featured product in a single, long development cycle.",
        "To adapt to changing requirements and deliver working software frequently and incrementally.",
        "To strictly adhere to a pre-defined plan without any scope for changes during development.",
        "To minimize documentation and formal processes to speed up development."
      ],
      topic: "General Software Development Life Cycle (SDLC)",
      difficulty: "moderate"
    },
    {
      id: 2,
      question: "In Git, what is the primary purpose of creating a new branch?",
      options: [
        "To permanently delete a portion of the codebase that is no longer needed.",
        "To create an isolated environment for developing new features or bug fixes without affecting the main codebase.",
        "To merge changes from different developers into a single commit.",
        "To revert the repository to a previous state after an error."
      ],
      topic: "Version Control (Git)",
      difficulty: "moderate"
    },
    {
      id: 3,
      question: "What is the main benefit of writing unit tests for a software component?",
      options: [
        "To verify the entire system's functionality from an end-user perspective.",
        "To ensure that individual functions or methods work correctly in isolation.",
        "To test the integration between different modules or services.",
        "To identify performance bottlenecks under heavy load."
      ],
      topic: "Software Testing",
      difficulty: "moderate"
    },
    {
      id: 4,
      question:
        "When debugging a software issue, which of the following is generally the most effective first step after identifying a problem?",
      options: [
        "Immediately trying random code changes until the issue disappears.",
        "Reinstalling the entire operating system to ensure a clean environment.",
        "Reproducing the bug consistently and narrowing down the scope of the problem.",
        "Blaming the network or hardware without further investigation."
      ],
      topic: "Problem Solving and Debugging",
      difficulty: "moderate"
    },
    {
      id: 5,
      question:
        "The 'Don't Repeat Yourself' (DRY) principle in software development primarily aims to:",
      options: [
        "Encourage developers to write the same code multiple times for redundancy.",
        "Reduce code duplication by abstracting common functionalities into reusable components.",
        "Mandate the use of specific programming languages for all projects.",
        "Prevent developers from using comments in their code."
      ],
      topic: "Software Design Principles",
      difficulty: "moderate"
    }
  ]
};

export const mockAnalysisResult = {
  company: "Tech Company",
  role_name: "Software Engineer",
  topics: "General",
  resumeSummary: "No resume provided",
  difficulty: "moderate",
  overallScore: 100,
  correctAnswers: 5,
  totalQuestions: 5,

  questionsAnalysis: [
    {
      question:
        "Which of the following best describes the primary goal of an Agile software development methodology?",
      candidateAnswer:
        "To adapt to changing requirements and deliver working software frequently and incrementally.",
      correctAnswer:
        "To adapt to changing requirements and deliver working software frequently and incrementally.",
      isCorrect: true,
      solution:
        "Agile methodologies prioritize flexibility and responsiveness to change over strict adherence to a plan, delivering value in small, iterative cycles.",
      topic: "General SDLC"
    },
    {
      question:
        "In Git, what is the primary purpose of creating a new branch?",
      candidateAnswer:
        "To create an isolated environment for developing new features or bug fixes without affecting the main codebase.",
      correctAnswer:
        "To create an isolated environment for developing new features or bug fixes without affecting the main codebase.",
      isCorrect: true,
      solution:
        "Git branches allow developers to work on new features or fixes in isolation, preventing disruption to the main development line.",
      topic: "Version Control"
    },
    {
      question:
        "What is the main benefit of writing unit tests for a software component?",
      candidateAnswer:
        "To ensure that individual functions or methods work correctly in isolation.",
      correctAnswer:
        "To ensure that individual functions or methods work correctly in isolation.",
      isCorrect: true,
      solution:
        "Unit tests focus on verifying the smallest testable parts of an application in isolation, ensuring their individual correctness.",
      topic: "Software Testing"
    },
    {
      question:
        "When debugging a software issue, which of the following is generally the most effective first step?",
      candidateAnswer:
        "Reproducing the bug consistently and narrowing down the scope of the problem.",
      correctAnswer:
        "Reproducing the bug consistently and narrowing down the scope of the problem.",
      isCorrect: true,
      solution:
        "Consistently reproducing a bug is crucial for understanding its conditions and behavior, which then allows for effective isolation and diagnosis.",
      topic: "Debugging"
    },
    {
      question:
        "The 'Don't Repeat Yourself' (DRY) principle in software development primarily aims to:",
      candidateAnswer:
        "Reduce code duplication by abstracting common functionalities into reusable components.",
      correctAnswer:
        "Reduce code duplication by abstracting common functionalities into reusable components.",
      isCorrect: true,
      solution:
        "The DRY principle advocates for avoiding redundancy in code, promoting the abstraction and reuse of common logic.",
      topic: "Design Principles"
    }
  ],

  metrics: {
    technicalKnowledge: 100,
    accuracy: 100
  },

  topicsCovered: [
    "General Software Development Life Cycle (SDLC)",
    "Version Control (Git)",
    "Software Testing",
    "Problem Solving and Debugging",
    "Software Design Principles"
  ],

  strengths: [
    "Strong foundational understanding across core software engineering topics.",
    "Exceptional accuracy in identifying correct solutions.",
    "Clear grasp of best practices and common principles."
  ],

  weaknesses:
    "No specific areas of weakness were identified based on the provided data.",

  feedback:
    "You've demonstrated an excellent grasp of fundamental software engineering concepts, achieving a perfect score. Your answers reflect a solid understanding of Agile, Git, unit testing, debugging strategies, and the DRY principle. Keep up the great work!"
};