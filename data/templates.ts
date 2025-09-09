// data/templates.ts
export type Template = {
  id: string
  title: string
  preset: any
}
export const featuredTemplates: Template[] = [
  {
    id: "blog-outline",
    title: "Blog outline (beginner, motivational)",
    preset: {
      useCase: "Text",
      audience: "Beginners",
      tone: ["motivational", "friendly"],
      outputFormat: "outline",
      roughIdea: "Write a blog outline about starting strength training at home.",
    },
  },
  {
    id: "tech-spec",
    title: "Technical spec (JSON)",
    preset: {
      useCase: "Documentation",
      audience: "Senior developers",
      tone: ["precise", "technical"],
      outputFormat: "json",
      roughIdea: "Create a technical specification for a REST API for a todo app.",
    },
  },
  {
    id: "midjourney",
    title: "Midjourney product photo",
    preset: {
      useCase: "Image",
      targetModel: "DALL·E/Midjourney",
      negative: "clutter",
      context: "Studio, soft light, product on seamless background",
      roughIdea: "A modern stainless-steel water bottle product shot.",
    },
  },
  {
    id: "youtube-script",
    title: "YouTube script (hook + CTA)",
    preset: {
      useCase: "Video Script",
      tone: ["friendly", "persuasive"],
      roughIdea: "A 5-minute video script on habit stacking.",
    },
  },
  {
    id: "academic-summary",
    title: "Academic summary (bullets + citations)",
    preset: {
      useCase: "Notes",
      outputFormat: "bullets",
      tone: ["academic"],
      roughIdea: "Summarize a paper on transformer architectures with citations placeholders.",
    },
  },
  {
    id: "sales-email",
    title: "Sales email (crisp)",
    preset: {
      useCase: "Text",
      tone: ["persuasive", "crisp"],
      roughIdea: "A cold outreach email to a startup CTO for a code review service.",
    },
  },
]
