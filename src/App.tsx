import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ParentPanel from "./pages/ParentPanel";
import BadgesPage from "./pages/BadgesPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { useCloudBadges } from "./hooks/useCloudBadges";
import { BadgeNotification } from "./components/BadgeNotification";

const queryClient = new QueryClient();

const AppContent = () => {
  const { newBadge, dismissBadgeNotification } = useCloudBadges();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/parent" element={<ParentPanel />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
      {/* Badge Notification */}
      {newBadge && (
        <BadgeNotification 
          badge={newBadge.badge} 
          onDismiss={dismissBadgeNotification} 
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
