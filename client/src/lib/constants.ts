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
      name: "Send welcome to e-learning email",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week -3": [
    {
      taskCode: "WM3T01",
      name: "Send welcome to e-learning email",
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
      name: "Send mail announcing start of the e-learning stage with Q&A sessions",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    },
    {
      taskCode: "WM2T03",
      name: "Send Elearning Q&A Session invites",
      duration: "0:10:00",
      assignedTo: "Organizer",
      owner: "Miguel",
      trainingType: "GLR"
    }
  ],
  "Week -1": [
    {
      taskCode: "WM1T01",
      name: "Update mailing list (names; groups information; schedule; edition)",
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
  ]
};
