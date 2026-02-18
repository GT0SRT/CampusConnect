
// MOCK USERS
export const mockUsers = [
    {
        uid: "user-1",
        id: "user-1",
        email: "alex.chen@mit.edu",
        displayName: "Alex Chen",
        name: "Alex Chen",
        photoURL: "https://i.pravatar.cc/150?img=12",
        campus: "MIT",
        branch: "Computer Science",
        batch: "2026",
        bio: "Full-stack developer | Open source enthusiast | Coffee addict ☕",
        skills: ["React", "Node.js", "Python", "Machine Learning"],
        interests: ["Web Development", "AI/ML", "Cybersecurity"],
        github: "alexchen",
        linkedin: "alex-chen-mit",
        portfolio: "https://alexchen.dev",
        karma: 1247,
        createdAt: new Date("2024-01-15").getTime(),
    },
    {
        uid: "user-2",
        id: "user-2",
        email: "priya.sharma@stanford.edu",
        displayName: "Priya Sharma",
        name: "Priya Sharma",
        photoURL: "https://i.pravatar.cc/150?img=5",
        campus: "Stanford",
        branch: "Data Science",
        batch: "2025",
        bio: "Data scientist in training | Passionate about using data for social good 📊",
        skills: ["Python", "R", "TensorFlow", "Data Visualization"],
        interests: ["Data Science", "Statistics", "Social Impact"],
        github: "priyasharma",
        linkedin: "priya-sharma-stanford",
        karma: 892,
        createdAt: new Date("2023-09-10").getTime(),
    },
    {
        uid: "user-3",
        id: "user-3",
        email: "james.wilson@berkeley.edu",
        displayName: "James Wilson",
        name: "James Wilson",
        photoURL: "https://i.pravatar.cc/150?img=33",
        campus: "UC Berkeley",
        branch: "Mechanical Engineering",
        batch: "2026",
        bio: "Building the future, one robot at a time 🤖",
        skills: ["CAD", "Robotics", "Arduino", "3D Printing"],
        interests: ["Robotics", "IoT", "Sustainable Energy"],
        github: "jameswilson",
        linkedin: "james-wilson-berkeley",
        karma: 654,
        createdAt: new Date("2024-02-20").getTime(),
    },
    {
        uid: "user-4",
        id: "user-4",
        email: "sarah.martinez@nyu.edu",
        displayName: "Sarah Martinez",
        name: "Sarah Martinez",
        photoURL: "https://i.pravatar.cc/150?img=9",
        campus: "NYU",
        branch: "Digital Media",
        batch: "2025",
        bio: "Creative designer | UX/UI enthusiast | Making the web beautiful ✨",
        skills: ["Figma", "Adobe XD", "Illustrator", "Photoshop"],
        interests: ["UI/UX Design", "Digital Art", "Typography"],
        portfolio: "https://sarahmartinez.design",
        karma: 521,
        createdAt: new Date("2023-08-05").getTime(),
    },
    {
        uid: "user-5",
        id: "user-5",
        email: "raj.patel@cmu.edu",
        displayName: "Raj Patel",
        name: "Raj Patel",
        photoURL: "https://i.pravatar.cc/150?img=15",
        campus: "CMU",
        branch: "Computer Science",
        batch: "2024",
        bio: "Algorithms & Systems | Intern @Google | Competitive programmer 💻",
        skills: ["C++", "Java", "Distributed Systems", "Algorithms"],
        interests: ["Competitive Programming", "System Design", "Cloud Computing"],
        github: "rajpatel",
        linkedin: "raj-patel-cmu",
        karma: 1523,
        createdAt: new Date("2022-09-01").getTime(),
    },
];

// MOCK POSTS
export const mockPosts = [
    {
        id: "post-1",
        uid: "user-1",
        type: "post",
        author: mockUsers[0],
        authorName: mockUsers[0].displayName,
        text: "Just finished my capstone project on real-time object detection using YOLO! 🎉 The journey from concept to deployment was challenging but incredibly rewarding. Happy to share my experience and code with anyone interested in computer vision.",
        imageUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&auto=format&fit=crop",
        likes: 45,
        likedBy: ["user-2", "user-3", "user-5"],
        commentsCount: 12,
        comments: [
            {
                id: "comment-1",
                uid: "user-2",
                author: mockUsers[1],
                text: "This looks amazing! Would love to see the code. Are you planning to open source it?",
                createdAt: Date.now() - 3600000,
            },
            {
                id: "comment-2",
                uid: "user-5",
                author: mockUsers[4],
                text: "Great work! YOLO is such a powerful framework. Did you use YOLOv8 or an earlier version?",
                createdAt: Date.now() - 1800000,
            },
        ],
        campus: mockUsers[0].campus,
        branch: mockUsers[0].branch,
        batch: mockUsers[0].batch,
        tags: ["Computer Vision", "Machine Learning", "YOLO"],
        bookmarked: false,
        createdAt: Date.now() - 7200000,
    },
    {
        id: "post-2",
        uid: "user-4",
        type: "post",
        author: mockUsers[3],
        authorName: mockUsers[3].displayName,
        text: "New design system for our campus app is finally live! 🎨 Focused heavily on accessibility and consistency. Check out the color palette and component library.",
        imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
        likes: 67,
        likedBy: ["user-1", "user-3"],
        commentsCount: 8,
        comments: [
            {
                id: "comment-3",
                uid: "user-1",
                author: mockUsers[0],
                text: "Love the color choices! The contrast ratios look WCAG compliant. Great job!",
                createdAt: Date.now() - 5400000,
            },
        ],
        campus: mockUsers[3].campus,
        branch: mockUsers[3].branch,
        batch: mockUsers[3].batch,
        tags: ["Design", "UI/UX", "Accessibility"],
        bookmarked: true,
        createdAt: Date.now() - 14400000,
    },
    {
        id: "post-3",
        uid: "user-3",
        type: "post",
        author: mockUsers[2],
        authorName: mockUsers[2].displayName,
        text: "Our robotics team just won 2nd place at the regional competition! 🏆 The autonomous navigation system worked flawlessly. Huge thanks to everyone who contributed. Here's our bot in action!",
        imageUrl: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?w=800&auto=format&fit=crop",
        likes: 123,
        likedBy: ["user-1", "user-2", "user-4", "user-5"],
        commentsCount: 24,
        comments: [
            {
                id: "comment-4",
                uid: "user-2",
                author: mockUsers[1],
                text: "Congratulations! The navigation looks incredibly smooth. What sensors did you use?",
                createdAt: Date.now() - 10800000,
            },
            {
                id: "comment-5",
                uid: "user-5",
                author: mockUsers[4],
                text: "Amazing work team! Second place is fantastic. Any plans for nationals?",
                createdAt: Date.now() - 9000000,
            },
        ],
        campus: mockUsers[2].campus,
        branch: mockUsers[2].branch,
        batch: mockUsers[2].batch,
        tags: ["Robotics", "Competition", "Engineering"],
        bookmarked: false,
        createdAt: Date.now() - 21600000,
    },
    {
        id: "post-4",
        uid: "user-5",
        type: "post",
        author: mockUsers[4],
        authorName: mockUsers[4].displayName,
        text: "Solved a really interesting distributed systems problem today involving consensus algorithms. The beauty of Raft protocol never ceases to amaze me. Thread explaining my implementation below 🧵",
        imageUrl: null,
        likes: 89,
        likedBy: ["user-1", "user-3"],
        commentsCount: 15,
        comments: [
            {
                id: "comment-6",
                uid: "user-1",
                author: mockUsers[0],
                text: "Raft is so elegant! Did you implement this from scratch or use a library?",
                createdAt: Date.now() - 7200000,
            },
        ],
        campus: mockUsers[4].campus,
        branch: mockUsers[4].branch,
        batch: mockUsers[4].batch,
        tags: ["Distributed Systems", "Consensus", "Algorithms"],
        bookmarked: true,
        createdAt: Date.now() - 28800000,
    },
    {
        id: "post-5",
        uid: "user-2",
        type: "post",
        author: mockUsers[1],
        authorName: mockUsers[1].displayName,
        text: "Completed my data visualization project on climate change trends. Using D3.js to create interactive charts that tell a compelling story. Data has the power to drive change! 🌍📈",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
        likes: 78,
        likedBy: ["user-3", "user-4"],
        commentsCount: 11,
        comments: [
            {
                id: "comment-7",
                uid: "user-4",
                author: mockUsers[3],
                text: "The visualizations are stunning! D3.js can be tricky. How long did this take?",
                createdAt: Date.now() - 14400000,
            },
        ],
        campus: mockUsers[1].campus,
        branch: mockUsers[1].branch,
        batch: mockUsers[1].batch,
        tags: ["Data Science", "Visualization", "Climate"],
        bookmarked: false,
        createdAt: Date.now() - 36000000,
    },
];

// MOCK THREADS
export const mockThreads = [
    {
        id: "thread-1",
        uid: "user-1",
        type: "thread",
        author: mockUsers[0],
        authorName: mockUsers[0].displayName,
        title: "Best practices for React performance optimization in 2025?",
        description: `I've been working on a large-scale React application and noticed some performance bottlenecks. What are your go-to strategies for optimizing React apps in 2025?

I'm particularly interested in:
- Code splitting strategies
- Memoization patterns
- Virtual scrolling for large lists
- Bundle size optimization

Would love to hear your experiences and recommendations!`,
        content: `I've been working on a large-scale React application and noticed some performance bottlenecks. What are your go-to strategies for optimizing React apps in 2025?

I'm particularly interested in:
- Code splitting strategies
- Memoization patterns
- Virtual scrolling for large lists
- Bundle size optimization

Would love to hear your experiences and recommendations!`,
        upvotes: 142,
        downvotes: 3,
        upvotedBy: ["user-2", "user-3", "user-4", "user-5"],
        downvotedBy: [],
        campus: mockUsers[0].campus,
        branch: mockUsers[0].branch,
        batch: mockUsers[0].batch,
        tags: ["React", "Performance", "Web Development"],
        views: 856,
        answersCount: 12,
        answers: [
            {
                id: "answer-1",
                uid: "user-5",
                author: mockUsers[4],
                content: "Great question! Here are my top recommendations:\n\n1. **React.lazy() and Suspense** for route-based code splitting\n2. **useMemo and useCallback** but don't overuse them\n3. **React Window** for virtual scrolling - game changer for large lists\n4. **Bundle analysis** with webpack-bundle-analyzer\n\nAlso, consider using the new React Compiler if you're on React 19!",
                upvotes: 89,
                downvotes: 1,
                upvotedBy: ["user-1", "user-2", "user-3"],
                downvotedBy: [],
                createdAt: Date.now() - 3600000,
                replies: [
                    {
                        id: "reply-1",
                        uid: "user-1",
                        author: mockUsers[0],
                        content: "Thanks! I haven't tried the React Compiler yet. Is it stable for production?",
                        createdAt: Date.now() - 1800000,
                    },
                ],
            },
        ],
        bookmarked: true,
        createdAt: Date.now() - 43200000,
    },
    {
        id: "thread-2",
        uid: "user-2",
        type: "thread",
        author: mockUsers[1],
        authorName: mockUsers[1].displayName,
        title: "How to prepare for data science internship interviews?",
        description: `I have interviews coming up for data science internships at several tech companies. What should I focus on to prepare effectively?

Looking for advice on:
- Statistics and probability questions
- Machine learning algorithm explanations
- SQL and data manipulation
- Case studies and business problems

Any resources or practice problems would be greatly appreciated!`,
        content: `I have interviews coming up for data science internships at several tech companies. What should I focus on to prepare effectively?

Looking for advice on:
- Statistics and probability questions
- Machine learning algorithm explanations
- SQL and data manipulation
- Case studies and business problems

Any resources or practice problems would be greatly appreciated!`,
        upvotes: 98,
        downvotes: 2,
        upvotedBy: ["user-1", "user-3", "user-4"],
        downvotedBy: [],
        campus: mockUsers[1].campus,
        branch: mockUsers[1].branch,
        batch: mockUsers[1].batch,
        tags: ["Data Science", "Interview Prep", "Career"],
        views: 645,
        answersCount: 8,
        answers: [],
        bookmarked: false,
        createdAt: Date.now() - 86400000,
    },
    {
        id: "thread-3",
        uid: "user-3",
        type: "thread",
        author: mockUsers[2],
        authorName: mockUsers[2].displayName,
        title: "Recommendations for Arduino alternatives in 2025?",
        description: `Arduino has been great for prototyping, but I'm looking for alternatives that offer more processing power and better connectivity options. What are you all using for IoT projects these days?

Requirements:
- WiFi/Bluetooth built-in
- More memory than Arduino Uno
- Good community support
- Reasonable price point

Considering ESP32 or Raspberry Pi Pico. Thoughts?`,
        content: `Arduino has been great for prototyping, but I'm looking for alternatives that offer more processing power and better connectivity options. What are you all using for IoT projects these days?

Requirements:
- WiFi/Bluetooth built-in
- More memory than Arduino Uno
- Good community support
- Reasonable price point

Considering ESP32 or Raspberry Pi Pico. Thoughts?`,
        upvotes: 67,
        downvotes: 1,
        upvotedBy: ["user-1", "user-5"],
        downvotedBy: [],
        campus: mockUsers[2].campus,
        branch: mockUsers[2].branch,
        batch: mockUsers[2].batch,
        tags: ["IoT", "Embedded Systems", "Hardware"],
        views: 423,
        answersCount: 6,
        answers: [],
        bookmarked: false,
        createdAt: Date.now() - 129600000,
    },
    {
        id: "thread-4",
        uid: "user-4",
        type: "thread",
        author: mockUsers[3],
        authorName: mockUsers[3].displayName,
        title: "Transitioning from Figma to code - best practices?",
        description: `As a designer learning to code my own designs, I'm struggling with the handoff from Figma to actual implementation. What workflows and tools do you recommend?

Specific questions:
- Design tokens and how to implement them
- Maintaining design consistency in code
- Tools for Figma to CSS/React conversion
- Component naming conventions

Trying to bridge the designer-developer gap! Any advice welcome.`,
        content: `As a designer learning to code my own designs, I'm struggling with the handoff from Figma to actual implementation. What workflows and tools do you recommend?

Specific questions:
- Design tokens and how to implement them
- Maintaining design consistency in code
- Tools for Figma to CSS/React conversion
- Component naming conventions

Trying to bridge the designer-developer gap! Any advice welcome.`,
        upvotes: 54,
        downvotes: 0,
        upvotedBy: ["user-1", "user-2"],
        downvotedBy: [],
        campus: mockUsers[3].campus,
        branch: mockUsers[3].branch,
        batch: mockUsers[3].batch,
        tags: ["Design", "Frontend", "Workflow"],
        views: 312,
        answersCount: 5,
        answers: [],
        bookmarked: true,
        createdAt: Date.now() - 172800000,
    },
];

// MOCK MATCHMAKER PROFILES
export const mockMatchmakerProfiles = [
    {
        id: "match-1",
        user: mockUsers[1],
        matchScore: 92,
        commonInterests: ["Machine Learning", "Web Development", "Data Science"],
        commonSkills: ["Python", "React"],
        reason: "High compatibility in technical skills and career interests",
    },
    {
        id: "match-2",
        user: mockUsers[4],
        matchScore: 88,
        commonInterests: ["Algorithms", "Web Development"],
        commonSkills: ["Python"],
        reason: "Shared passion for computer science fundamentals",
    },
    {
        id: "match-3",
        user: mockUsers[3],
        matchScore: 76,
        commonInterests: ["Web Development"],
        commonSkills: [],
        reason: "Complementary skills in development and design",
    },
];

// HELPER FUNCTIONS

export const getUserById = (uid) => {
    return mockUsers.find((u) => u.uid === uid || u.id === uid) || mockUsers[0];
};

export const getPostById = (postId) => {
    return mockPosts.find((p) => p.id === postId);
};

export const getThreadById = (threadId) => {
    return mockThreads.find((t) => t.id === threadId);
};

// Get paginated posts
export const getPaginatedPosts = (page = 1, limit = 10) => {
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    return {
        items: mockPosts.slice(startIdx, endIdx),
        hasMore: endIdx < mockPosts.length,
        total: mockPosts.length,
    };
};

// Get paginated threads
export const getPaginatedThreads = (page = 1, limit = 10) => {
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    return {
        items: mockThreads.slice(startIdx, endIdx),
        hasMore: endIdx < mockThreads.length,
        total: mockThreads.length,
    };
};
