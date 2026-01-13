export interface Project {
  // Mongo's own ObjectId (not used directly in the app)
  _id?: string;
  // Stable, app-level id we control (used in URLs and lookups)
  id?: string;
  user_id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  _id?: string; 
  title: string;
  completed: boolean;
  notes?: string;
}

export interface User {
  _id?: string
  user_id: string
  email: string
  name: string
  interests: string[]
  experienceLevel: "beginner" | "intermediate" | "advanced"
  learningGoals: string[]
  streak: number
  xp: number
  createdAt: Date
}

export interface Session {
  _id?: string
  user_id: string
  subject: string
  description: string
  host_user_id: string
  date: Date
  createdAt: Date
}

export interface Activity {
  _id?: string
  user_id: string
  type: "module_completed" | "note_saved" | "file_uploaded" | "session_joined"
  projectId?: string
  timestamp: Date
}
