import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Selection from "./pages/Selection";
import Form from "./pages/Form";
import History from "./pages/History";
import HistoryProcuraSe from "./pages/HistoryProcuraSe";
import HistoryTaNaMao from "./pages/HistoryTaNaMao";
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/selection" element={<Selection />} />
          <Route path="/form" element={<Form />} />
          <Route path="/history" element={<History />} />
          <Route path="/history-procura-se" element={<HistoryProcuraSe />} />
          <Route path="/history-ta-na-mao" element={<HistoryTaNaMao />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
