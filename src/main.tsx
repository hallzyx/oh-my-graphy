import React from 'react'
import ReactDOM from 'react-dom/client'
import { createAgent, registerTools } from '@ui-sdk/react/agent'
import App from './App'
import './index.css'
export const uiAgent = createAgent()
const unregister = registerTools(uiAgent, { allow: step => !step.confirm })
if (import.meta.hot) import.meta.hot.dispose(unregister)
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
