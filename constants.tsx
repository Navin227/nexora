
import { Community, Project, User, Role } from './types';

export interface DirectMessage {
  id: string;
  userId: string;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export const MOCK_DMS: DirectMessage[] = [
  {
    id: 'dm1',
    userId: 'u2',
    senderName: 'Sarah Chen',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    lastMessage: 'The new designs for Nexora are ready for review!',
    timestamp: '2m ago',
    unread: true
  },
  {
    id: 'dm2',
    userId: 'u3',
    senderName: 'Jordan Smith',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    lastMessage: 'Are we still on for the 4pm standup?',
    timestamp: '1h ago',
    unread: false
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivers',
    role: 'Full Stack Developer',
    college: 'MIT Pune',
    bio: 'Passionate about building scalable web applications and exploring the future of decentralized tech.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    skills: ['React', 'Node.js', 'Solidity', 'Tailwind'],
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    reputation: 1250
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    role: 'UI/UX Designer',
    college: 'IIT Delhi',
    bio: 'Creating human-centric designs for complex problems.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skills: ['Figma', 'Prototyping', 'Accessibility'],
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    reputation: 980
  },
  {
    id: 'u3',
    name: 'Jordan Smith',
    role: 'Backend Dev',
    college: 'Stanford',
    bio: 'Building the plumbing for the modern web.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    skills: ['Go', 'Rust', 'K8s'],
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    reputation: 1500
  }
];

const COMMUNITY_ROLES: Role[] = [
  { id: 'r1', name: 'Maintainer', color: 'text-rose-500' },
  { id: 'r2', name: 'Contributor', color: 'text-indigo-500' },
  { id: 'r3', name: 'Community Member', color: 'text-slate-500' }
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'c1',
    name: 'OpenSource Innovators',
    description: 'A community for students building the next generation of open-source tools.',
    icon: '✨',
    memberCount: 840,
    projectCount: 12,
    tags: ['open-source', 'productivity', 'tools'],
    createdBy: 'u1',
    roles: COMMUNITY_ROLES,
    members: [
      { userId: 'u1', roleId: 'r1' },
      { userId: 'u2', roleId: 'r2' },
      { userId: 'u3', roleId: 'r3' }
    ],
    channels: [
      { id: 'ch1', name: 'general', type: 'chat' },
      { id: 'ch2', name: 'help-desk', type: 'chat' },
      { id: 'ch3', name: 'showcase', type: 'chat' },
    ]
  },
  {
    id: 'c2',
    name: 'Sustainability Tech',
    description: 'Using technology to solve environmental challenges.',
    icon: '🌿',
    memberCount: 420,
    projectCount: 5,
    tags: ['environment', 'iot', 'energy'],
    createdBy: 'u2',
    roles: COMMUNITY_ROLES,
    members: [
      { userId: 'u2', roleId: 'r1' },
      { userId: 'u1', roleId: 'r2' }
    ],
    channels: [
      { id: 'ch5', name: 'general', type: 'chat' },
      { id: 'ch6', name: 'research', type: 'chat' },
    ]
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'EcoTracker App',
    description: 'Mobile application to monitor carbon footprint for urban residents.',
    communityId: 'c2',
    status: 'Ongoing',
    techStack: ['React Native', 'Firebase'],
    contributors: ['u2', 'u1'],
    rolesNeeded: ['Frontend Dev', 'UX Designer'],
    tasks: [],
    resources: [
      { id: 'res1', title: 'Main Documentation', url: 'https://docs.example.com', type: 'doc' },
      { id: 'res2', title: 'Design Assets', url: 'https://figma.com', type: 'link' }
    ],
    milestones: [
      { id: 'm1', title: 'Phase 1: Discovery', description: '', dueDate: '2025-01-01', status: 'completed' },
      { id: 'm2', title: 'Phase 2: MVP Development', description: '', dueDate: '2025-12-01', status: 'active' }
    ],
    repositoryUrl: 'https://github.com/ecotracker/app',
    currentVersion: 'v0.4.2-beta',
    createdBy: 'u2'
  },
  {
    id: 'p2',
    name: 'Nexus API Wrapper',
    description: 'A lightweight wrapper for the Nexora internal API.',
    communityId: 'c1',
    status: 'Proposed',
    techStack: ['TypeScript', 'Node.js'],
    contributors: ['u1'],
    rolesNeeded: ['Backend Engineer'],
    tasks: [],
    resources: [],
    milestones: [
       { id: 'm1', title: 'Phase 1: RFC', description: '', dueDate: '2025-02-01', status: 'active' }
    ],
    repositoryUrl: 'https://github.com/nexora/api-wrapper',
    currentVersion: 'v0.0.1',
    createdBy: 'u1'
  }
];
