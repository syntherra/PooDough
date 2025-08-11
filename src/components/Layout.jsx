import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import { motion } from 'framer-motion'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main content area */}
      <main className="flex-1 pb-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
      
      {/* Bottom navigation */}
      <Navigation />
    </div>
  )
}

export default Layout