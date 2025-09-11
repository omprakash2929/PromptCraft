"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun, LogOut, User } from "lucide-react"
import { useTheme } from "next-themes"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getAccount } from "@/lib/appwriteClient"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useCurrentUser()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = async () => {
    try {
      const account = getAccount()
      await account.deleteSession("current")
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PC</span>
            </div>
            <span className="font-bold text-xl text-foreground">PromptCraft</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-accent transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-accent transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-accent transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-accent transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            {!loading && (
              <>
                {user ? (
                  // Show user menu when logged in
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  // Show login/signup when not logged in
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            <button className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#features" className="block px-3 py-2 text-muted-foreground hover:text-accent">
                Features
              </Link>
              <Link href="#pricing" className="block px-3 py-2 text-muted-foreground hover:text-accent">
                Pricing
              </Link>
              <Link href="#about" className="block px-3 py-2 text-muted-foreground hover:text-accent">
                About
              </Link>
              <Link href="#contact" className="block px-3 py-2 text-muted-foreground hover:text-accent">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 px-3 pt-4">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link href="/dashboard">
                          <Button variant="outline" className="w-full bg-transparent">
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login">
                          <Button variant="outline" className="w-full bg-transparent">
                            Log in
                          </Button>
                        </Link>
                        <Link href="/dashboard">
                          <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
