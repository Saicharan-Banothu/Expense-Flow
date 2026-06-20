import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { api } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Moon, Sun, User, Laptop, CheckCircle2, AlertCircle } from "lucide-react"

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const payload: any = { name, email }
      if (password) {
        payload.password = password
      }
      
      await api.put("/auth/me", payload)
      await refreshUser()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setPassword("") // Clear password field after success
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to update profile' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-gradient">Settings & Preferences</h2>
        <p className="text-lg text-muted-foreground">Manage your account settings and customize your experience.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass overflow-hidden border-t-4 border-t-primary shadow-xl">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Profile Details
            </CardTitle>
            <CardDescription className="text-base">Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  <p className="font-medium">{message.text}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg py-6 bg-muted/50 focus:bg-background transition-colors" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email Address</label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-lg py-6 bg-muted/50 focus:bg-background transition-colors" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">New Password <span className="text-muted-foreground font-normal">(Leave blank to keep current)</span></label>
                <Input 
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-lg py-6 bg-muted/50 focus:bg-background transition-colors" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full text-lg py-6 primary-gradient font-bold shadow-lg shadow-primary/25"
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden border-t-4 border-t-accent shadow-xl">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sun className="h-6 w-6 text-accent-foreground" />
              Appearance
            </CardTitle>
            <CardDescription className="text-base">Customize how ExpenseFlow looks on your device</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant={theme === "light" ? "default" : "outline"}
                className={`h-24 flex flex-col gap-2 ${theme === "light" ? "primary-gradient shadow-lg" : ""}`}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                <span className="font-semibold text-base">Light</span>
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"}
                className={`h-24 flex flex-col gap-2 ${theme === "dark" ? "primary-gradient shadow-lg" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                <span className="font-semibold text-base">Dark</span>
              </Button>
              <Button 
                variant={theme === "system" ? "default" : "outline"}
                className={`h-24 flex flex-col gap-2 ${theme === "system" ? "primary-gradient shadow-lg" : ""}`}
                onClick={() => setTheme("system")}
              >
                <Laptop className="h-6 w-6" />
                <span className="font-semibold text-base">System</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
