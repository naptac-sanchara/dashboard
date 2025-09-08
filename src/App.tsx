// Tailwind styles are imported via src/main.tsx -> index.css
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

function App() {
  return <RouterProvider router={router} />
}

export default App
