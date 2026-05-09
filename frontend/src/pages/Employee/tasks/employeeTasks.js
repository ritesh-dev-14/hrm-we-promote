export const employeeTasks = [
  {
    id: "SUB-001",

    title: "Camera Setup",

    description:
      "Setup all cinematic cameras, tripods, batteries, and stabilizers before wedding shoot starts.",

    priority: "high",

    status: "in_progress",

    progress: 65,

    deadline: "2026-05-15",

    assignedBy: {
      id: "MGR-001",
      name: "Rohit Sharma",
    },

    parentTask: {
      id: "TASK-001",
      title: "Wedding Shoot - Chandigarh",
    },

    qualityChecks: [
      "Camera lenses cleaned",
      "Battery backup checked",
      "Tripods balanced",
    ],
  },

  {
    id: "SUB-002",

    title: "Drone Coverage",

    description:
      "Capture aerial cinematic wedding shots including entry scenes and outdoor venue visuals.",

    priority: "medium",

    status: "pending",

    progress: 10,

    deadline: "2026-05-17",

    assignedBy: {
      id: "MGR-001",
      name: "Rohit Sharma",
    },

    parentTask: {
      id: "TASK-001",
      title: "Wedding Shoot - Chandigarh",
    },

    qualityChecks: [
      "Drone calibration required",
      "Outdoor lighting check pending",
    ],
  },

  {
    id: "SUB-003",

    title: "Podcast Audio Setup",

    description:
      "Configure microphones, sound mixer, and headphone monitoring system for podcast production.",

    priority: "low",

    status: "completed",

    progress: 100,

    deadline: "2026-05-11",

    assignedBy: {
      id: "MGR-002",
      name: "Simran Gill",
    },

    parentTask: {
      id: "TASK-003",
      title: "Podcast Production Setup",
    },

    qualityChecks: [
      "Audio distortion removed",
      "Noise reduction tested",
      "Mic levels balanced",
    ],
  },

  {
    id: "SUB-004",

    title: "Food Cinematic Reel",

    description:
      "Capture slow-motion cinematic shots of food items and customer dining experience for Instagram marketing.",

    priority: "high",

    status: "review",

    progress: 90,

    deadline: "2026-05-20",

    assignedBy: {
      id: "MGR-003",
      name: "Aman Verma",
    },

    parentTask: {
      id: "TASK-004",
      title: "Restaurant Promotional Reel",
    },

    qualityChecks: [
      "Slow-motion clips rendered",
      "Lighting setup completed",
      "Color grading applied",
    ],
  },
];