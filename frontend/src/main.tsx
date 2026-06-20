import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="expenseflow-theme">
      <GoogleOAuthProvider clientId="522375016876-93bc7qup1lprkgkpnt3846defv9fsaav.apps.googleusercontent.com">
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
