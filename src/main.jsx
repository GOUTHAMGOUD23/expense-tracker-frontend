import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (e) {
  document.body.innerHTML = "<h1 style='color:red'>APP CRASHED</h1>"
  console.error(e)
}