export const WEEK_OPTIONS = [
  { value: "all", label: "All Weeks" },
  { value: "-5", label: "Week -5" },
  { value: "-4", label: "Week -4" },
  { value: "-3", label: "Week -3" },
  { value: "-2", label: "Week -2" },
  { value: "-1", label: "Week -1" },
  { value: "1", label: "Week 1" },
  { value: "2", label: "Week 2" },
  { value: "3", label: "Week 3" },
  { value: "4", label: "Week 4" },
  { value: "5", label: "Week 5" },
  { value: "6", label: "Week 6" },
  { value: "7", label: "Week 7" },
  { value: "8", label: "Week 8" },
];

export const TRAINING_TYPE_OPTIONS = [
  { value: "all", label: "All Training Types" },
  { value: "GLR", label: "GLR" },
  { value: "SLR", label: "SLR" },
];

export const TASK_STATUS_OPTIONS = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
  { value: "Done", label: "Done" },
];

export const OWNER_OPTIONS = [
  { value: "Miguel", label: "Miguel" },
  { value: "Afonso", label: "Afonso" },
  { value: "Telmo", label: "Telmo" },
  { value: "Luis", label: "Luis" },
  { value: "Trainers", label: "Trainers" },
  { value: "E-learning Q&A", label: "E-learning Q&A" },
  { value: "Hands-on Q&A", label: "Hands-on Q&A" },
  { value: "Platform Engineering", label: "Platform Engineering" },
];

export const ASSIGNED_TO_OPTIONS = [
  { value: "Organizer", label: "Organizer" },
  { value: "Trainers", label: "Trainers" },
  { value: "E-learning Q&A", label: "E-learning Q&A" },
  { value: "Hands-on Q&A", label: "Hands-on Q&A" },
  { value: "Enviroment", label: "Enviroment" },
];

export const TASK_TEMPLATE = {
  "Week -5": [
    {
      taskCode: "WM5T01",
      name: "Check if the cohort for the edition exists and if not create it",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM5T02",
      name: "Create mailing list (names; groups information; schedule; edition)",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM5T03",
      name: "Copy course's path and update exam and assignments dates and configure cohorts",
      duration: "0:15:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM5T04",
      name: "Trainers should send changes in the e-learning assignment to Training Team",
      duration: "0:01:00",
      assignedTo: "Trainers",
      owner: "Trainers",
      trainingType: "GLR"
    }
  ],
  "Week -4": [
    {
      taskCode: "WM4T01",
      name: "Update cohort and training tracking system",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week -3": [
    {
      taskCode: "WM3T01",
      name: "Prepare welcome resources for participants",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM3T02",
      name: "Request Marketing team to remove schedule from CM site",
      duration: "0:01:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week -2": [
    {
      taskCode: "WM2T01",
      name: "Include links of the exam, mailing and edition folder to trainers",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM2T02",
      name: "Announce start of the e-learning stage with Q&A sessions",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM2T03",
      name: "Schedule Elearning Q&A Sessions",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week -1": [
    {
      taskCode: "WM1T01",
      name: "Update participant list (names; groups information; schedule; edition)",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM1T02",
      name: "Verify if the e-learning group elements are correct",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week 1": [
    {
      taskCode: "W1T01",
      name: "First week of training - Welcome session",
      duration: "1:00:00",
      assignedTo: "Trainers",
      owner: "Trainers",
      trainingType: "GLR"
    },
    {
      taskCode: "W1T02",
      name: "Set up training environment for participants",
      duration: "0:30:00",
      assignedTo: "Organizer",
      owner: "Platform Engineering",
      trainingType: "GLR"
    }
  ],
  "Week 2": [
    {
      taskCode: "W2T01",
      name: "Weekly progress review meeting",
      duration: "0:30:00",
      assignedTo: "Trainers",
      owner: "Trainers",
      trainingType: "GLR"
    },
    {
      taskCode: "W2T02",
      name: "Post reminder about assignments due",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week 3": [
    {
      taskCode: "W3T01",
      name: "Mid-training survey distribution",
      duration: "0:15:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "W3T02",
      name: "Weekly progress review meeting",
      duration: "0:30:00",
      assignedTo: "Trainers", 
      owner: "Trainers",
      trainingType: "GLR"
    }
  ],
  "Week 4": [
    {
      taskCode: "W4T01",
      name: "Weekly progress review meeting",
      duration: "0:30:00",
      assignedTo: "Trainers",
      owner: "Trainers",
      trainingType: "GLR"
    },
    {
      taskCode: "W4T02",
      name: "Prepare for final project presentations",
      duration: "1:00:00",
      assignedTo: "Trainers",
      owner: "Trainers",
      trainingType: "GLR"
    }
  ],
  "Week 5": [
    {
      taskCode: "W5T01",
      name: "Final project presentations",
      duration: "2:00:00",
      assignedTo: "Trainers",
      owner: "Trainers",
      trainingType: "GLR"
    },
    {
      taskCode: "W5T02",
      name: "Final assessment distribution",
      duration: "0:15:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week 6": [
    {
      taskCode: "W6T01",
      name: "Collect and analyze final assessment results",
      duration: "1:00:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "W6T02",
      name: "Prepare certificates of completion",
      duration: "0:30:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week 7": [
    {
      taskCode: "W7T01",
      name: "Send certificates to participants",
      duration: "0:15:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "W7T02",
      name: "Follow-up with participants who didn't complete training",
      duration: "0:30:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week 8": [
    {
      taskCode: "W8T01",
      name: "Training program retrospective meeting",
      duration: "1:00:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "W8T02",
      name: "Prepare training report",
      duration: "1:30:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "W8T03",
      name: "Archive training materials",
      duration: "0:30:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ]
};
