import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import Layout from "./components/Layout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import Installments from "@/pages/Installments";
import Reports from "@/pages/Reports";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/clients"} component={Clients} />
        <Route path={"/products"} component={Products} />
        <Route path={"/sales"} component={Sales} />
        <Route path="/installments" component={Installments} />
      <Route path="/reports" component={Reports} />
      <Route path="*" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DatabaseProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
