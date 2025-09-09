import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Sparkles, Zap, Users, ArrowRight, Check } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background animate-gradient"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
              Generate <span className="text-primary">better prompts</span>,<br />
              get <span className="text-accent">better AI results</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              PromptCraft helps you turn rough ideas into precise, high-signal prompts for any AI model. Boost your
              productivity with structured prompt engineering.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
                  Launch App <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg bg-transparent">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for <span className="text-primary">prompt engineering</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to help you craft, refine, and manage your AI prompts like a pro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Prompt Refinement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Refine prompts with structured controls and intelligent suggestions to get better AI outputs every
                  time.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Personal Library</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Save, search, and organize your best prompts in your personal library for quick access and reuse.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
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
            Simple, <span className="text-accent">transparent pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">Get started for free during our hackathon period</p>

          <Card className="max-w-md mx-auto border-2 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Hackathon Special</h3>
                <div className="text-4xl font-bold text-primary mb-2">Free</div>
                <p className="text-muted-foreground">Limited time offer</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-3" />
                  <span>Unlimited prompt generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-3" />
                  <span>Personal prompt library</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-3" />
                  <span>Export functionality</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-accent mr-3" />
                  <span>Community support</span>
                </li>
              </ul>

              <Link href="/dashboard">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3">
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
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
            <p>&copy; 2024 PromptCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
