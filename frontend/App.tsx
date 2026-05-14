import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import LoginScreen from './screens/LoginScreen';
import LandingScreen from './screens/LandingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProjectDetailsScreen from './screens/ProjectDetailsScreen';
import RankingScreen from './screens/RankingScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import NewTaskScreen from './screens/NewTaskScreen';
import NewProjectScreen from './screens/NewProjectScreen';
import JoinProjectScreen from './screens/JoinProjectScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import NewEventScreen from './screens/NewEventScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminProjectsScreen from './screens/AdminProjectsScreen';
import SignUpScreen from './screens/SignUpScreen';

import ProjectLandingScreen from './screens/ProjectLandingScreen';
import GroupsHubScreen from './screens/GroupsHubScreen';
import NewGroupScreen from './screens/NewGroupScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import JobsBoardScreen from './screens/JobsBoardScreen';
import NewJobPostingScreen from './screens/NewJobPostingScreen';
import ProjectRequestsScreen from './screens/ProjectRequestsScreen';
import GroupRequestsScreen from './screens/GroupRequestsScreen';

import { Toaster } from 'react-hot-toast';
import { BrandingProvider } from './contexts/BrandingContext';
import { LoginRequiredProvider } from './components/LoginRequiredModal';

const HomeRoute = () => {
  const hasToken = !!localStorage.getItem('token');
  return hasToken ? <Navigate to="/dashboard" replace /> : <LandingScreen />;
};

const App = () => {
  return (
    <HashRouter>
      <BrandingProvider>
        <LoginRequiredProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/sign-up" element={<SignUpScreen />} />

          <Route element={<Layout />}>
            {/* Home pública (landing pra guest, redirect pra dashboard pra logado) */}
            <Route path="/" element={<HomeRoute />} />

            {/* Públicas (com auth opcional) */}
            <Route path="/projects" element={<ProjectsScreen />} />
            <Route path="/groups" element={<GroupsHubScreen />} />
            <Route path="/jobs" element={<JobsBoardScreen />} />
            <Route path="/ranking" element={<RankingScreen />} />

            {/* Autenticadas */}
            <Route path="/dashboard" element={<RequireAuth><DashboardScreen /></RequireAuth>} />
            <Route path="/project-details/:id" element={<RequireAuth><ProjectDetailsScreen /></RequireAuth>} />
            <Route path="/kanban/:id" element={<RequireAuth><ProjectDetailsScreen /></RequireAuth>} />
            <Route path="/achievements" element={<RequireAuth><AchievementsScreen /></RequireAuth>} />
            <Route path="/activities" element={<RequireAuth><ActivitiesScreen /></RequireAuth>} />

            <Route path="/new-task" element={<RequireAuth><NewTaskScreen /></RequireAuth>} />
            <Route path="/edit-task/:id" element={<RequireAuth><NewTaskScreen /></RequireAuth>} />
            <Route path="/new-project" element={<RequireAuth><NewProjectScreen /></RequireAuth>} />
            <Route path="/edit-project/:id" element={<RequireAuth><NewProjectScreen /></RequireAuth>} />
            <Route path="/join-project" element={<RequireAuth><JoinProjectScreen /></RequireAuth>} />
            <Route path="/eventos/novo" element={<RequireAuth><NewEventScreen /></RequireAuth>} />
            <Route path="/eventos/editar/:id" element={<RequireAuth><NewEventScreen /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
            <Route path="/profile/:id" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
            <Route path="/project-requests/:id" element={<RequireAuth><ProjectRequestsScreen /></RequireAuth>} />

            <Route path="/project-landing/:id" element={<RequireAuth><ProjectLandingScreen /></RequireAuth>} />
            <Route path="/groups/new" element={<RequireAuth><NewGroupScreen /></RequireAuth>} />
            <Route path="/groups/:id/edit" element={<RequireAuth><NewGroupScreen /></RequireAuth>} />
            <Route path="/groups/:id" element={<RequireAuth><GroupDetailScreen /></RequireAuth>} />
            <Route path="/groups/:id/requests" element={<RequireAuth><GroupRequestsScreen /></RequireAuth>} />
            <Route path="/jobs/new" element={<RequireAuth><NewJobPostingScreen /></RequireAuth>} />

            {/* Admin */}
            <Route path="/admin/users" element={<RequireAuth><AdminUsersScreen /></RequireAuth>} />
            <Route path="/admin/projects" element={<RequireAuth><AdminProjectsScreen /></RequireAuth>} />

            {/* Catch-all: cai pra home (landing/dashboard) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </LoginRequiredProvider>
      </BrandingProvider>
    </HashRouter>
  );
};

export default App;
