import api from './api';

export interface CreateEventData {
    title: string;
    type: 'MEETING' | 'WORKSHOP' | 'EVENT';
    date: string;
    time: string;
    location?: string;
    description?: string;
}

export interface EventParticipant {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        avatarColor?: string;
    };
    joinedAt: string;
}

export interface Event {
    id: string;
    title: string;
    type: 'MEETING' | 'WORKSHOP' | 'EVENT';
    date: string;
    time: string;
    location?: string;
    description?: string;
    createdById: string;
    createdBy: {
        id: string;
        name: string;
        avatarColor?: string;
    };
    participants: EventParticipant[];
    createdAt: string;
}

export const getEvents = async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
};

export const createEvent = async (data: CreateEventData): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
};

export const getEventById = async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
};

export const updateEvent = async (id: string, data: Partial<CreateEventData>): Promise<Event> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
};

export const joinEvent = async (id: string): Promise<void> => {
    await api.post(`/events/${id}/join`);
};

export const leaveEvent = async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/join`);
};
