export const managerTasks = [
  {
    id: "TASK-001",

    title: "Wedding Shoot - Chandigarh",

    description:
      "Complete cinematic wedding coverage including drone shots, couple reels, interviews, and cinematic transitions for social media delivery.",

    priority: "high",

    status: "in_progress",

    stage: "shooting",

    progress: 46,

    dueDate: "2026-05-20",

    createdAt: "2026-05-09",

    assignedBy: {
      id: "HR-001",
      name: "Ritesh Sharma",
    },

    assignedManager: {
      id: "MGR-001",
      name: "Rohit Sharma",
      avatar: "https://i.pravatar.cc/150?img=12",
    },

    employees: [
      {
        id: "EMP-001",
        name: "Aman Verma",
        role: "Camera Operator",
        status: "available",
        avatar: "https://i.pravatar.cc/150?img=21",
      },

      {
        id: "EMP-002",
        name: "Neha Kapoor",
        role: "Drone Operator",
        status: "busy",
        avatar: "https://i.pravatar.cc/150?img=32",
      },

      {
        id: "EMP-003",
        name: "Karan Mehta",
        role: "Lighting Artist",
        status: "available",
        avatar: "https://i.pravatar.cc/150?img=15",
      },
    ],

    subtasks: [
      {
        id: "SUB-001",

        title: "Camera Setup",

        description:
          "Setup all primary and secondary cinematic cameras before shoot starts.",

        assignedEmployee: {
          id: "EMP-001",
          name: "Aman Verma",
        },

        status: "in_progress",

        progress: 65,

        deadline: "2026-05-12",
      },

      {
        id: "SUB-002",

        title: "Drone Coverage",

        description:
          "Capture aerial cinematic shots for outdoor wedding sequences.",

        assignedEmployee: {
          id: "EMP-002",
          name: "Neha Kapoor",
        },

        status: "pending",

        progress: 10,

        deadline: "2026-05-13",
      },
    ],
  },

  {
    id: "TASK-002",

    title: "Restaurant Promotional Reel",

    description:
      "Create high-quality food cinematic reels and customer experience visuals for Instagram marketing.",

    priority: "medium",

    status: "pending",

    stage: "planning",

    progress: 14,

    dueDate: "2026-05-18",

    createdAt: "2026-05-08",

    assignedBy: {
      id: "HR-002",
      name: "Simran Gill",
    },

    assignedManager: {
      id: "MGR-001",
      name: "Rohit Sharma",
      avatar: "https://i.pravatar.cc/150?img=12",
    },

    employees: [
      {
        id: "EMP-004",
        name: "Priya Malhotra",
        role: "Content Creator",
        status: "available",
        avatar: "https://i.pravatar.cc/150?img=28",
      },

      {
        id: "EMP-005",
        name: "Sahil Arora",
        role: "Video Editor",
        status: "available",
        avatar: "https://i.pravatar.cc/150?img=48",
      },
    ],

    subtasks: [
      {
        id: "SUB-003",

        title: "Food Cinematic Shots",

        description: "Capture slow-motion food shots with cinematic lighting.",

        assignedEmployee: {
          id: "EMP-004",
          name: "Priya Malhotra",
        },

        status: "pending",

        progress: 0,

        deadline: "2026-05-14",
      },
    ],
  },

  {
    id: "TASK-003",

    title: "Podcast Production Setup",

    description:
      "Manage complete multi-camera podcast production workflow with audio and lighting setup.",

    priority: "low",

    status: "completed",

    stage: "completed",

    progress: 100,

    dueDate: "2026-05-10",

    createdAt: "2026-05-04",

    assignedBy: {
      id: "ADMIN-001",
      name: "Admin User",
    },

    assignedManager: {
      id: "MGR-001",
      name: "Rohit Sharma",
      avatar: "https://i.pravatar.cc/150?img=12",
    },

    employees: [
      {
        id: "EMP-006",
        name: "Arjun Singh",
        role: "Audio Engineer",
        status: "available",
        avatar: "https://i.pravatar.cc/150?img=52",
      },
    ],

    subtasks: [
      {
        id: "SUB-004",

        title: "Mic & Audio Setup",

        description: "Configure all microphones and sound monitoring systems.",

        assignedEmployee: {
          id: "EMP-006",
          name: "Arjun Singh",
        },

        status: "completed",

        progress: 100,

        deadline: "2026-05-06",
      },
    ],
  },
];
