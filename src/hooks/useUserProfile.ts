import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { UserData, Skill, User } from '@/types/user'; // Import User as well

// Mock data for initial setup - REMOVE once API is integrated
const mockSkills: Skill[] = [
  { name: 'JavaScript', level: 'Advanced', category: 'Frontend', proficiency: 80 },
  { name: 'React', level: 'Advanced', category: 'Frontend', proficiency: 75 },
  { name: 'Node.js', level: 'Intermediate', category: 'Backend', proficiency: 60 },
  { name: 'Python', level: 'Intermediate', category: 'Backend', proficiency: 55 },
  { name: 'Machine Learning', level: 'Beginner', category: 'AI', proficiency: 40 },
];

const mockUserData: UserData = {
  nickname: 'alexj',
  realName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  profileImage: 'https://example.com/avatar.jpg',
  bio: 'Full-stack developer passionate about open source and AI.',
  githubConnected: false,
  githubUsername: 'alexj-dev', // This will be replaced by store or fetched data
  skills: mockSkills,
  region: 'North America',
  timezone: 'PST',
  country: 'USA',
  city: 'San Francisco',
  privacy: {
    profileVisibility: 'public',
    showRealName: true,
    showEmail: false,
  },
  accountCreatedAt: new Date().toISOString(),
  githubLastAnalyzed: undefined,
};

export const useUserProfile = () => {
  const { user, githubUsername: storeGithubUsername, setGithubUsername } = useUserStore();
  const [userData, setUserData] = useState<UserData | null>(mockUserData); // Initialize with mock
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let profileData: UserData = { ...mockUserData }; // Start with mock

        const typedUser = user as User | null; // Explicitly type user from store

        if (typedUser) {
          profileData = {
            ...profileData, // Keep other mock data for now
            nickname: typedUser.name || mockUserData.nickname, // Assuming nickname can be derived from user.name
            realName: typedUser.name || mockUserData.realName,
            email: typedUser.email || mockUserData.email,
            profileImage: typedUser.avatar_url || mockUserData.profileImage,
            githubUsername: storeGithubUsername || typedUser.githubUsername || mockUserData.githubUsername,
            githubConnected: !!(storeGithubUsername || typedUser.githubUsername)
          };
        }
        
        // If githubUsername from store is available, ensure it's set in userData
        if (storeGithubUsername) {
          profileData.githubUsername = storeGithubUsername;
          profileData.githubConnected = true;
        }

        setUserData(profileData);
        
        // Ensure the store is updated if user object had a githubUsername not yet in storeGithubUsername
        if (typedUser?.githubUsername && typedUser.githubUsername !== storeGithubUsername) {
          setGithubUsername(typedUser.githubUsername);
        }

      } catch (err) {
        setError('Failed to fetch user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, storeGithubUsername, setGithubUsername]);

  const updateUserGithubUsername = (newUsername: string | null) => {
    setGithubUsername(newUsername); 
    if (userData) {
      setUserData({ 
        ...userData, 
        githubUsername: newUsername || '', // Ensure string, or handle null in UserData type
        githubConnected: !!newUsername 
      });
    }
    // TODO: Add API call to persist this change to the backend
    console.log(`GitHub username updated to: ${newUsername}. Persist this change.`);
  };

  return { userData, loading, error, updateUserGithubUsername };
};
