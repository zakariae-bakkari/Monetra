# Monetra: Personal Finance Tracker

A modern web application for tracking personal finances, managing wallets, and monitoring transactions with a clean, intuitive interface.

<!-- ![Monetra Dashboard Preview](https://placeholder-for-screenshot.com) -->

## Overview

Monetra helps you take control of your personal finances by providing tools to track expenses, monitor budgets, and visualize your financial health across multiple wallets and accounts.

## Features

- **Transaction Management**: Log income and expenses with detailed categorization
- **Multiple Wallets**: Track different accounts, cash, credit cards, and savings
- **Calendar View**: Visualize your financial activity on a daily, weekly, and monthly basis
- **Dashboard Analytics**: Get insights into your spending habits with charts and summaries
- **Expected Returns**: Keep track of loans and money owed to you with due dates
- **Dark/Light Mode**: Choose your preferred theme for comfortable use
- **Local & Cloud Storage**: Store your data securely with Appwrite backend

## Tech Stack

- React/Next.js with TypeScript
- Tailwind CSS with shadcn/ui components
- Appwrite for authentication and data storage
- date-fns for date handling
- Recharts for data visualization

## Screenshots

### Dashboard
*Dashboard with financial summary, wallet overview, and spending analytics*

### Transaction List
*Searchable and filterable list of all your transactions*

### Calendar View
*Calendar showing daily financial activity with popover details*

### Profile & Settings
*Account management and personalization options*

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/zakariae-bakkari/Monetra.git
   cd monetra
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```
   # Create a .env.local file with your Appwrite credentials
   NEXT_PUBLIC_APPWRITE_ENDPOINT=your-appwrite-endpoint
   NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The app can be deployed to Vercel, Netlify, or any hosting service that supports Next.js applications.

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Future Enhancements

- Budget planning and tracking features
- Recurring transaction automation
- Financial goal setting and tracking
- Mobile app version
- Data import/export from financial institutions
- Reports and additional analytics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Appwrite](https://appwrite.io/) for backend services
- [Recharts](https://recharts.org/) for data visualization

---

*Made with ❤️ by [zakariae-bakkari]*