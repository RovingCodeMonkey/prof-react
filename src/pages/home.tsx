import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import dotnetLogo from '../assets/dotnet.svg'
import sqliteLogo from '../assets/sqlite.svg'
import typescriptLogo from '../assets/typescript.svg'
import tailwindLogo from '../assets/tailwindcss.svg'
import shadcnLogo from '../assets/shadcnui.svg'
import heroImg from '../assets/hero.png'
import '../App.css'

export function HomePage() {
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Welcome to the Profisee Demo</h1>
          <p>
            A description of the project is below
          </p>
          <p>
            Links to the GIT repo are top right            
          </p>
          <p>            
            All of the Requested pages and flow are available in the navigation bar at the top of the page.
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon float-left" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2 className="text-center">Back End</h2>
          <ul>
            <li>
              <a href="https://dotnet.microsoft.com/en-us/apps/aspnet" target="_blank">
                <img className="logo" src={dotnetLogo} alt="" />
                ASP.NET Core WebAPI
              </a>
            </li>
            <li>
              <a href="https://learn.microsoft.com/en-us/ef/core/" target="_blank">
                <img className="logo" src={dotnetLogo} alt="" />
                EF Core
              </a>
            </li>
            <li>
              <a href="https://www.sqlite.org/" target="_blank">
                <img className="logo" src={sqliteLogo} alt="" />
                SQLite
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon float-left" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2 className="text-center">Front End</h2>
          <ul>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="logo" src={reactLogo} alt="" />
                React
              </a>
            </li>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Vite
              </a>
            </li>
            <li>
              <a href="https://www.typescriptlang.org/" target="_blank">
                <img className="logo" src={typescriptLogo} alt="" />
                TypeScript
              </a>
            </li>
            <li>
              <a href="https://tailwindcss.com/" target="_blank">
                <img className="logo" src={tailwindLogo} alt="" />
                Tailwind CSS
              </a>
            </li>
            <li>
              <a href="https://ui.shadcn.com/" target="_blank">
                <img className="logo" src={shadcnLogo} alt="" />
                Shadcn
              </a>
            </li>
            <li>
              <a href="https://github.com/pmndrs/zustand" target="_blank">
                Zustand
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}