import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UsersPage from "./pages/Users/UsersPage";
import OrganizationForm from "./pages/Organization/OrganizationForm";
import OrganizationList from "./pages/Organization/OrganizationList";
import PositionForm from "./pages/Position/PositionForm";
import PositionList from "./pages/Position/PositionList";
import ElectionList from "./pages/Election/ElectionList";
import ElectionForm from "./pages/Election/ElectionForm";
import CandidateList from "./pages/Candidate/CandidateList";
import CandidateForm from "./pages/Candidate/CandidateForm";
import VoterList from "./pages/Voter/VoterList";
import VoterForm from "./pages/Voter/VoterForm";
import GroupForm from "./pages/Group/GroupForm";
import GroupList from "./pages/Group/GroupList";
import ElectionPage from "./pages/Election/ElectionPage";
import HomeDashboard from "./pages/HomePages/HomeDashboard";
import CandidatePage from "./pages/Candidate/CandidatePage";
import VotingPage from "./pages/voting/VotingPage";
import ResultPage from "./pages/voting/ResultPage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/election/result/:electionId" element={<ResultPage />} />
        <Route path="/election/:electionId/voting" element={<VotingPage />} />
        <Route path="/elections" element={<ElectionPage />} />

        <Route path="election/:id/apply" element={<CandidateForm />} />
        <Route path="election/:id/candidates" element={<CandidateList />} />
        <Route path="/candidates" element={<CandidatePage />} />
        <Route path="voter/new" element={<VoterForm />} />

        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />

          <Route path="users" element={<UsersPage />} />

          {/* Organization Pages */}
          <Route path="organization" element={<OrganizationList />} />
          <Route path="organization/new" element={<OrganizationForm />} />
          <Route path="organization/edit/:id" element={<OrganizationForm />} />

          {/* Position Pages */}
          <Route path="position" element={<PositionList />} />
          <Route path="position/new" element={<PositionForm />} />
          <Route path="position/edit/:id" element={<PositionForm />} />

          {/* group Pages */}
          <Route path="group" element={<GroupList />} />
          <Route path="group/new" element={<GroupForm />} />
          <Route path="group/edit/:id" element={<GroupForm />} />

          {/*  Election Pages */}
          <Route path="election" element={<ElectionList />} />
          <Route path="election/new" element={<ElectionForm />} />
          <Route path="election/edit/:id" element={<ElectionForm />} />

          {/* Candidate Pages */}
          <Route path="candidate" element={<CandidateList />} />
          <Route path="candidate/edit/:id" element={<CandidateForm />} />

          {/* Voter Pages */}
          <Route path="voter" element={<VoterList />} />
          <Route path="voter/edit/:id" element={<VoterForm />} />
        </Route>

        <Route path="profile" element={<UserProfiles />} />

        {/* Auth Pages */}
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />

        {/* Home pages */}
        <Route path="Home" element={<HomeDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
