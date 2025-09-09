import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Zap, Users, ArrowRight, Check, Star } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-orange-400/5 to-background animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium mb-6 animate-glow">
              <Star className="w-4 h-4 mr-2 text-amber-400" />
              <span className="text-white">Free during hackathon period</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
              Generate <span className="gradient-text">better prompts</span>,<br />
              get <span className="gradient-text">better AI results</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              PromptCraft helps you turn rough ideas into precise, high-signal prompts for any AI model. Boost your
              productivity with structured prompt engineering.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all animate-glow border-0"
                >
                  Launch App <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg bg-transparent hover:bg-muted/50 transition-all border-purple-500/30 text-foreground hover:border-purple-500/50"
                >
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for <span className="gradient-text">prompt engineering</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to help you craft, refine, and manage your AI prompts like a pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 glass-card hover:border-purple-500/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Prompt Refinement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Refine prompts with structured controls and intelligent suggestions to get better AI outputs every
                  time.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 glass-card hover:border-orange-400/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-orange-400/30 group-hover:to-orange-500/30 transition-all">
                  <Zap className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Personal Library</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Save, search, and organize your best prompts in your personal library for quick access and reuse.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 glass-card hover:border-purple-500/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-purple-500/30 group-hover:to-orange-400/30 transition-all">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Export and share your prompts with your team to maintain consistency across projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">Get started for free during our hackathon period</p>

          <Card className="max-w-md mx-auto glass-card border-purple-500/30 shadow-lg hover:shadow-xl transition-all animate-glow">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-orange-400/20 to-orange-500/20 text-orange-400 text-sm font-medium mb-4 border border-orange-400/30">
                  Limited Time
                </div>
                <h3 className="text-2xl font-bold mb-2">Hackathon Special</h3>
                <div className="text-4xl font-bold gradient-text mb-2">Free</div>
                <p className="text-muted-foreground">No credit card required</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Unlimited prompt generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Personal prompt library</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Export functionality</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span>Community support</span>
                </li>
              </ul>

              <Link href="/dashboard">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500 text-white py-3 shadow-lg hover:shadow-xl transition-all border-0">
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-orange-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PC</span>
                </div>
                <span className="font-bold text-xl">PromptCraft</span>
              </div>
              <p className="text-primary-foreground/80 max-w-md">
                The ultimate tool for crafting better AI prompts and getting superior results from any language model.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <Link href="#features" className="hover:text-primary-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>
                  <Link href="#" className="hover:text-primary-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2025 PromptCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
