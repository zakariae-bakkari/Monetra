// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Minus, Square, X } from 'lucide-react';
// import { usePathname } from 'next/navigation';
// import { Button } from '../ui/button';
// import { TutorialButton } from '../tutorial/TutorialButton';
// import {
//   getDashboardTutorial,
//   getTransactionsTutorial,
//   getWalletsTutorial,
// } from '@src/lib/tutorialSteps';

// declare global {
//   interface Window {
//     electron: {
//       minimizeWindow: () => void;
//       maximizeWindow: () => void;
//       closeWindow: () => void;
//     };
//   }
// }

// interface TitleBarProps {
//   title: string;
// }

// export function TitleBar({ title }: TitleBarProps) {
//   const pathname = usePathname();
//   const [tutorialId, setTutorialId] = useState<string>('dashboard');
//   const [tutorialSteps, setTutorialSteps] = useState<any[]>([]);

//   // Load appropriate tutorial steps based on current path
//   useEffect(() => {
//     if (pathname.includes('dashboard')) {
//       setTutorialId('dashboard-tutorial');
//       setTutorialSteps(getDashboardTutorial());
//     } else if (pathname.includes('transactions')) {
//       setTutorialId('transactions-tutorial');
//       setTutorialSteps(getTransactionsTutorial());
//     } else if (pathname.includes('wallets')) {
//       setTutorialId('wallets-tutorial');
//       setTutorialSteps(getWalletsTutorial());
//     } else {
//       setTutorialId('general-tutorial');
//       setTutorialSteps(getDashboardTutorial()); // Default to dashboard tutorial
//     }
//   }, [pathname]);

//   const handleMinimize = () => {
//     if (window.electron) {
//       window.electron.minimizeWindow();
//     }
//   };

//   const handleMaximize = () => {
//     if (window.electron) {
//       window.electron.maximizeWindow();
//     }
//   };

//   const handleClose = () => {
//     if (window.electron) {
//       window.electron.closeWindow();
//     }
//   };

//   return (
//     <div className="flex flex-col space-y-4 mb-6">
//       <div className="h-8 flex items-center justify-between bg-background px-2">
//         <div className="flex-1 px-2">
//           <span className="text-sm font-medium">Monetra</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-6 w-6 p-0"
//             onClick={handleMinimize}
//           >
//             <Minus className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-6 w-6 p-0"
//             onClick={handleMaximize}
//           >
//             <Square className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
//             onClick={handleClose}
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Page Title and Tutorial Button */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
//         <TutorialButton tutorialId={tutorialId} steps={tutorialSteps} />
//       </div>
//     </div>
//   );
// }