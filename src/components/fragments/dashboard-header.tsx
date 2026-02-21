'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  onSignOut: () => void;
}

export function DashboardHeader({ onSignOut }: DashboardHeaderProps) {
  const { user } = useAuth();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);

  const toggleSidenav = () => setIsSidenavOpen(!isSidenavOpen);
  const closeSidenav = () => setIsSidenavOpen(false);

  return (
    <>
      <motion.header 
        className="border-b bg-card fixed top-0 left-0 right-0 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">PPT Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile menu button - visible only on small screens, positioned on the right */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleSidenav}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop view - email and logout inline */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={onSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Add top padding to main content to account for fixed header */}
      <div className="h-16" />

      {/* Mobile sidenav backdrop */}
      <AnimatePresence>
        {isSidenavOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidenav}
            />
            
            {/* Sidenav panel - white background, properly elevated */}
            <motion.aside
              className="fixed top-0 right-0 h-full w-64 bg-white border-l z-50 md:hidden flex flex-col shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <span className="font-semibold">Menu</span>
                <Button variant="ghost" size="icon" onClick={closeSidenav}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex-1 p-4 flex flex-col gap-4 bg-white">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium break-all">{user?.email}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-auto"
                  onClick={() => {
                    closeSidenav();
                    onSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

