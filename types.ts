export type ProjectStatus = 'Proposed' | 'Ongoing' | 'Completed';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  college: string;
  bio: string;
  avatar: string;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  cvUrl?: string;
  reputation: number;
  hasOnboarded?: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
}

export interface ProjectResource {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'doc' | 'repo' | 'image' | 'file';
  size?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'active' | 'completed';
  attachedAssetId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  communityId: string;
  status: ProjectStatus;
  techStack: string[];
  contributors: string[];
  tasks: Task[];
  milestones: Milestone[];
  resources: ProjectResource[];
  repositoryUrl?: string;
  currentVersion?: string;
  rolesNeeded?: string[];
  createdBy: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  userId: string;
  roleId: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  projectCount: number;
  channels: Channel[];
  tags: string[];
  createdBy: string;
  roles: Role[];
  members: Member[];
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  communityId?: string;
  projectId?: string;
  targetName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'chat' | 'project-list';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}
