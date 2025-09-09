// components/prompt-anatomy.tsx
export function PromptAnatomy() {
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <h3 className="font-semibold text-foreground">Prompt Anatomy</h3>
      <ol className="list-decimal list-inside space-y-1">
        <li>Context</li>
        <li>Role & Goal</li>
        <li>Input Summary</li>
        <li>Constraints</li>
        <li>Output Format</li>
        <li>Style</li>
        <li>Examples (optional)</li>
      </ol>
    </div>
  )
}
