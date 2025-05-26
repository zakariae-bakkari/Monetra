import { TutorialStep } from "@src/context/tutorialContext";

// Dashboard tutorial steps
export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: "dashboard-overview",
    title: "Welcome to Your Dashboard",
    description: "This is your financial command center where you can track your finances at a glance.",
    target: ".dashboard-overview",
    position: "bottom",
    order: 0
  },
  {
    id: "activity-chart",
    title: "Activity Chart",
    description: "View your income and expenses over time to track your financial trends.",
    target: ".activity-chart",
    position: "bottom",
    order: 1
  },
  {
    id: "summary-cards",
    title: "Financial Summary",
    description: "Quick view of your total balance, income, and expenses for the current period.",
    target: ".summary-cards",
    position: "top",
    order: 2
  },
  {
    id: "wallet-cards",
    title: "Your Wallets",
    description: "Manage all your accounts in one place. Add new wallets or view details of existing ones.",
    target: ".wallet-cards",
    position: "left",
    order: 3
  },
  {
    id: "category-pie-chart",
    title: "Spending by Category",
    description: "See where your money is going with this breakdown of expenses by category.",
    target: ".category-pie-chart",
    position: "right",
    order: 4
  }
];

// Transactions tutorial steps
export const transactionsTutorialSteps: TutorialStep[] = [
  {
    id: "transactions-list",
    title: "Transactions List",
    description: "All your transactions in one place. Search, filter, and sort to find what you're looking for.",
    target: ".transactions-list",
    position: "top",
    order: 0
  },
  {
    id: "add-transaction",
    title: "Add New Transaction",
    description: "Click here to record a new income or expense transaction.",
    target: ".add-transaction-button",
    position: "bottom",
    order: 1
  },
  {
    id: "filter-transactions",
    title: "Filter Transactions",
    description: "Use these filters to narrow down transactions by date, category, or account.",
    target: ".filter-transactions",
    position: "bottom",
    order: 2
  }
];

// Wallets tutorial steps
export const walletsTutorialSteps: TutorialStep[] = [
  {
    id: "wallets-overview",
    title: "Wallets Overview",
    description: "Manage all your accounts including bank accounts, credit cards, and cash.",
    target: ".wallets-overview",
    position: "top",
    order: 0
  },
  {
    id: "add-wallet",
    title: "Add New Wallet",
    description: "Add a new account or wallet to track your finances more effectively.",
    target: ".add-wallet-button",
    position: "bottom",
    order: 1
  },
  {
    id: "wallet-balance",
    title: "Wallet Balance",
    description: "Keep track of your balance in each wallet and see your overall financial health.",
    target: ".wallet-balance",
    position: "right",
    order: 2
  }
];

// Settings tutorial steps
export const settingsTutorialSteps: TutorialStep[] = [
  {
    id: "settings-overview",
    title: "Settings",
    description: "Customize your Monetra experience and manage your account settings.",
    target: ".settings-overview",
    position: "top",
    order: 0
  },
  {
    id: "theme-toggle",
    title: "Theme Settings",
    description: "Switch between light and dark mode for your preferred viewing experience.",
    target: ".theme-toggle",
    position: "bottom",
    order: 1
  },
  {
    id: "profile-settings",
    title: "Profile Information",
    description: "Update your personal information and account details here.",
    target: ".profile-settings",
    position: "right",
    order: 2
  }
];

// Calendar tutorial steps
export function getCalendarTutorial() {
  return [
    {
      id: "calendar-overview",
      title: "Financial Calendar",
      description: "View your financial events and transactions on this calendar.",
      target: ".calendar-container",
      position: "top" as const,
      order: 1,
    },
    {
      id: "calendar-navigation",
      title: "Calendar Navigation",
      description: "Use these controls to navigate between different time periods.",
      target: ".calendar-navigation",
      position: "bottom" as const,
      order: 2,
    },
    {
      id: "calendar-events",
      title: "Calendar Events",
      description: "Click on any day to see or add events for that day.",
      target: ".calendar-day",
      position: "right" as const,
      order: 3,
    }
  ];
}