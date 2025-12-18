import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UsersPage from "./pages/Users/UsersPage";
import OrganizationForm from "./pages/Organization/OrganizationForm";
import OrganizationList from "./pages/Organization/OrganizationList";
import PositionForm from "./pages/Position/PositionForm";
import PositionList from "./pages/Position/PositionList";
import AffiliationList from "./pages/Affiliation/AffiliationList";
import AffiliationForm from "./pages/Affiliation/AffiliationForm";
import ElectionList from "./pages/Election/ElectionList";
import ElectionForm from "./pages/Election/ElectionForm";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
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

          <Route path="affiliation" element={<AffiliationList />} />
          <Route path="affiliation/new" element={<AffiliationForm />} />
          <Route path="affiliation/edit/:id" element={<AffiliationForm />} />

          {/* ✅ Election Pages */}
          <Route path="election" element={<ElectionList />} />
          <Route path="election/new" element={<ElectionForm />} />
          <Route path="election/edit/:id" element={<ElectionForm />} />

          {/* Other Pages */}
          <Route path="profile" element={<UserProfiles />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="blank" element={<Blank />} />

          {/* Forms */}
          <Route path="form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="basic-tables" element={<BasicTables />} />

          {/* UI Elements */}
          <Route path="alerts" element={<Alerts />} />
          <Route path="avatars" element={<Avatars />} />
          <Route path="badge" element={<Badges />} />
          <Route path="buttons" element={<Buttons />} />
          <Route path="images" element={<Images />} />
          <Route path="videos" element={<Videos />} />

          {/* Charts */}
          <Route path="line-chart" element={<LineChart />} />
          <Route path="bar-chart" element={<BarChart />} />
        </Route>

        {/* Auth Pages */}
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
