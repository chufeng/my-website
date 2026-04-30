import React from 'react'
import { createRoot } from 'react-dom/client'
import Portfolio from './Portfolio.jsx'
import LoveTimer from './LoveTimer.jsx'

const pathname = window.location.pathname
const App = pathname.endsWith('/love') || pathname.endsWith('/love/')
  ? LoveTimer
  : Portfolio

createRoot(document.getElementById('root')).render(<App />)
