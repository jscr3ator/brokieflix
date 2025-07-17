import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Search } from "./pages/Search";
import { Info } from "./pages/Info";
import { Player } from "./pages/Player";
import { Episodes } from "./pages/Episodes";
import { Episode } from "./pages/Episode";
import { Person } from "./pages/Person";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/info" element={<Info />} />
          <Route path="/player" element={<Player />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/episode" element={<Episode />} />
          <Route path="/person" element={<Person />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
