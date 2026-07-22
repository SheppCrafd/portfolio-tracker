import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { migrateLegacyStorageKeys } from '@/lib/migrateLegacyStorage'

migrateLegacyStorageKeys()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
