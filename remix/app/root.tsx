import { Links, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { RecoilRoot } from "recoil";
import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import { StyledEngineProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionExpiredModal } from "./components/Modals";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0",
  },
];

export default function App() {
  const queryClient = new QueryClient();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />
      </head>
      <body className="">
        <RecoilRoot>
          <StyledEngineProvider injectFirst>
            <QueryClientProvider client={queryClient}>
              <Outlet />
            </QueryClientProvider>
            <ScrollRestoration />
            <Scripts />
          </StyledEngineProvider>
        </RecoilRoot>
      </body>
    </html>
  );
}
