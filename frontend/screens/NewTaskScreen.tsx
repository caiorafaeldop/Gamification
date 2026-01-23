import React from 'react';
import { useNewTaskForm } from '../hooks/useNewTaskForm';
import MobileNewTaskScreen from '../components/MobileNewTaskScreen';
import DesktopNewTaskScreen from '../components/DesktopNewTaskScreen';

const NewTaskScreen = () => {
    const { isMobile, ...formProps } = useNewTaskForm();

    if (isMobile) {
        return <MobileNewTaskScreen {...formProps} />;
    }

    return <DesktopNewTaskScreen {...formProps} />;
};

export default NewTaskScreen;