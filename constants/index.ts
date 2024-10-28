export const sidebarLinksAdmin = [
  {
    imgURL: "/icons/home.svg",
    route: "/a-dash",
    label: "Dashboard",
  },
  {
    imgURL: "/icons/transaction.svg",//check this icon
    route: "/a-projects",
    label: "Projects",
  },
  {
    imgURL: "/icons/deposit.svg",
    route: "/a-attendance",
    label: "Atendance Tracking",
  },

  {
    imgURL: "/icons/transaction.svg",
    route: "/a-reports",
    label: "Reports",
  },
  {
    imgURL: "/icons/transaction.svg",
    route: "/a-calendar",
    label: "Calendar",
  },
  {
    imgURL: "/icons/home.svg",
    route: "/a-creation",
    label: "Shift Creation",
  },
  {
    imgURL: "/icons/money-send.svg",
    route: "/a-allocations",
    label: "Shift Alloction",
  },

  {
    imgURL: "/icons/dollar-circle.svg",
    route: "/a-invitations",
    label: "Add Users",
  },

];

export const sidebarLinksClient = [
  {
    imgURL: "/icons/home.svg",
    route: "/c-dash",
    label: "Dashboard",
  },
  {
    imgURL: "/icons/transaction.svg",//check this icon
    route: "/c-projects",
    label: "Projects",
  },
  {
    imgURL: "/icons/deposit.svg",
    route: "/c-attendace",
    label: "Attendance Tracking",
  },

  {
    imgURL: "/icons/money-send.svg",//check icon
    route: "/c-calendar",
    label: "Calendar",
  },
  {
    imgURL: "/icons/money-send.svg",//check icon
    route: "/c-shifts",
    label: "Create Shifts",
  },
  {
    imgURL: "/icons/money-send.svg",//check icon
    route: "/c-invite",
    label: "Add Users",
  },
 
];

export const sidebarLinksGate = [
  {
    imgURL: "/icons/home.svg",
    route: "/g-dash",
    label: "Dashboard",
  },

  {
    imgURL: "/icons/deposit.svg",
    route: "/g-report",
    label: "Reports",
  },

  {
    imgURL: "/icons/dollar-circle.svg",
    route: "/g-update",
    label: "Availability",
  },
];

export const sidebarLinksLeader = [
  {
    imgURL: "/icons/home.svg",
    route: "/l-dash",
    label: "Dashboard",
  },

  {
    imgURL: "/icons/deposit.svg",
    route: "/l-report",
    label: "Reports",
  },

  {
    imgURL: "/icons/dollar-circle.svg",
    route: "/l-update",
    label: "Availability",
  },
];

export const sidebarLinksStudent = [
  {
    imgURL: "/icons/home.svg",
    route: "/s-dash",
    label: "Dashboard",
  },

  {
    imgURL: "/icons/deposit.svg",
    route: "/s-report",
    label: "Reports",
  },

  {
    imgURL: "/icons/dollar-circle.svg",
    route: "/s-update",
    label: "Availability",
  },

];



export const topCategoryStyles = {
  "Food and Drink": {
    bg: "bg-blue-25",
    circleBg: "bg-blue-100",
    text: {
      main: "text-blue-900",
      count: "text-blue-700",
    },
    progress: {
      bg: "bg-blue-100",
      indicator: "bg-blue-700",
    },
    icon: "/icons/monitor.svg",
  },
  Travel: {
    bg: "bg-success-25",
    circleBg: "bg-success-100",
    text: {
      main: "text-success-900",
      count: "text-success-700",
    },
    progress: {
      bg: "bg-success-100",
      indicator: "bg-success-700",
    },
    icon: "/icons/coins.svg",
  },
  default: {
    bg: "bg-pink-25",
    circleBg: "bg-pink-100",
    text: {
      main: "text-pink-900",
      count: "text-pink-700",
    },
    progress: {
      bg: "bg-pink-100",
      indicator: "bg-pink-700",
    },
    icon: "/icons/shopping-bag.svg",
  },
};

export const transactionCategoryStyles = {
  "Food and Drink": {
    borderColor: "border-pink-600",
    backgroundColor: "bg-pink-500",
    textColor: "text-pink-700",
    chipBackgroundColor: "bg-inherit",
  },
  Payment: {
    borderColor: "border-success-600",
    backgroundColor: "bg-green-600",
    textColor: "text-success-700",
    chipBackgroundColor: "bg-inherit",
  },
  "Bank Fees": {
    borderColor: "border-success-600",
    backgroundColor: "bg-green-600",
    textColor: "text-success-700",
    chipBackgroundColor: "bg-inherit",
  },
  Transfer: {
    borderColor: "border-red-700",
    backgroundColor: "bg-red-700",
    textColor: "text-red-700",
    chipBackgroundColor: "bg-inherit",
  },
  Processing: {
    borderColor: "border-[#F2F4F7]",
    backgroundColor: "bg-gray-500",
    textColor: "text-[#344054]",
    chipBackgroundColor: "bg-[#F2F4F7]",
  },
  Success: {
    borderColor: "border-[#12B76A]",
    backgroundColor: "bg-[#12B76A]",
    textColor: "text-[#027A48]",
    chipBackgroundColor: "bg-[#ECFDF3]",
  },
  default: {
    borderColor: "",
    backgroundColor: "bg-blue-500",
    textColor: "text-blue-700",
    chipBackgroundColor: "bg-inherit",
  },
};
