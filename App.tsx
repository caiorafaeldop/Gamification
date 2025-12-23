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

const App = () => {
  return (
    <HashRouter>
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
          <Route path="/new-project" element={<NewProjectScreen />} />
          <Route path="/join-project" element={<JoinProjectScreen />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;