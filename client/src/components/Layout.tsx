import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Users, Package, ShoppingCart, CreditCard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/clients", label: "Clientes", icon: Users },
    { href: "/products", label: "Produtos", icon: Package },
    { href: "/sales", label: "Vendas", icon: ShoppingCart },
    { href: "/installments", label: "Parcelas", icon: CreditCard },
    { href: "/reports", label: "Relatórios", icon: BarChart3 },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                F
              </div>
              <span className="hidden sm:inline">FelixADM</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <a
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(href)
                      ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-100"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                </a>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden border-t bg-background/50 backdrop-blur">
            <div className="flex flex-col">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <a
                    className={`px-4 py-3 text-sm font-medium border-b transition-colors flex items-center gap-2 ${
                      isActive(href)
                        ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-100"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-around">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a
                className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                  isActive(href)
                    ? "text-pink-600 dark:text-pink-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate">{label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-20" />
    </div>
  );
}
