import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProjectListScreen from './screens/ProjectListScreen';
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

import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <HashRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#021B35',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LoginScreen />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/projects" element={<ProjectListScreen />} />
          <Route path="/project-details/:id" element={<ProjectDetailsScreen />} />
          <Route path="/kanban/:id" element={<ProjectDetailsScreen />} /> {/* Reusing details for kanban view */}
          <Route path="/ranking" element={<RankingScreen />} />
          <Route path="/achievements" element={<AchievementsScreen />} />
          <Route path="/activities" element={<ActivitiesScreen />} />

          <Route path="/new-task" element={<NewTaskScreen />} />
          <Route path="/edit-task/:id" element={<NewTaskScreen />} />
          <Route path="/new-project" element={<NewProjectScreen />} />
          <Route path="/join-project" element={<JoinProjectScreen />} />
          <Route path="/eventos/novo" element={<NewEventScreen />} />
          <Route path="/eventos/editar/:id" element={<NewEventScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<AdminUsersScreen />} />
          <Route path="/admin/projects" element={<AdminProjectsScreen />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
