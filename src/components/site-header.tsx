import { NavLink } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { to: "/customers", label: "Customers" },
  { to: "/discounts", label: "Discounts" },
  { to: "/products", label: "Products" },
  { to: "/sales", label: "Sales" },
  { to: "/salesperson", label: "Salesperson" },
  { to: "/reports", label: "Reports" },
]

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <nav className="flex items-center space-x-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" })
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <a
              href="https://github.com/RovingCodeMonkey/prof-react"
              target="_blank"
              rel="noreferrer"
              title="Front End"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </a>
               <a
              href="https://github.com/RovingCodeMonkey/prof-c-sharp-mvc"
              target="_blank"
              rel="noreferrer"
              title="Back End"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
