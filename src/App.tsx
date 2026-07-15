import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EditorProvider } from "@/contexts/EditorContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Index from "@/pages/Index.tsx";
import OurServices from "@/pages/OurServices.tsx";
import JobSeekers from "@/pages/JobSeekers.tsx";
import JobReferrer from "@/pages/JobReferrer.tsx";
import AgencyPage from "@/pages/AgencyPage.tsx";
import CurrentVacancy from "@/pages/CurrentVacancy.tsx";
import Contact from "@/pages/Contact.tsx";
import Auth from "@/pages/Auth.tsx";
import Admin from "@/pages/Admin.tsx";
import TermsPage from "@/pages/TermsPage.tsx";
import PrivacyPage from "@/pages/PrivacyPage.tsx";
import CustomPage from "@/pages/CustomPage.tsx";
import NotFound from "@/pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <EditorProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/our-services" element={<OurServices />} />
              <Route path="/job-seekers" element={<JobSeekers />} />
              <Route path="/job-referrer" element={<JobReferrer />} />
              <Route path="/agency" element={<AgencyPage />} />
              <Route path="/current-vacancy" element={<CurrentVacancy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/p/:slug" element={<CustomPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EditorProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
