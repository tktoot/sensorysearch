export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-4">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SensorySearch LLC · All rights reserved.
        </p>
      </div>
    </footer>
  )
}
