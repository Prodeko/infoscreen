import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AccentureScreen from './AccentureScreen'

// biome-ignore lint/style/noNonNullAssertion: index.html always has #root
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AccentureScreen />
	</React.StrictMode>,
)
