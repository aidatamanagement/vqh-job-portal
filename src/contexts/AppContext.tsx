
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, JobApplication, JobPosition, JobLocation, User, FilterState } from '@/types';

interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Jobs state
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  
  // Applications state
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  
  // Master data
  positions: JobPosition[];
  setPositions: React.Dispatch<React.SetStateAction<JobPosition[]>>;
  locations: JobLocation[];
  setLocations: React.Dispatch<React.SetStateAction<JobLocation[]>>;
  
  // UI state
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  // Initialize with sample data
  useEffect(() => {
    // Sample positions
    setPositions([
      { id: '1', name: 'Registered Nurse', createdAt: new Date().toISOString() },
      { id: '2', name: 'Certified Nursing Assistant', createdAt: new Date().toISOString() },
      { id: '3', name: 'Social Worker', createdAt: new Date().toISOString() },
      { id: '4', name: 'Chaplain', createdAt: new Date().toISOString() },
      { id: '5', name: 'Physical Therapist', createdAt: new Date().toISOString() },
      { id: '6', name: 'Home Health Aide', createdAt: new Date().toISOString() },
    ]);

    // Sample locations
    setLocations([
      { id: '1', name: 'Los Angeles, CA', createdAt: new Date().toISOString() },
      { id: '2', name: 'San Francisco, CA', createdAt: new Date().toISOString() },
      { id: '3', name: 'San Diego, CA', createdAt: new Date().toISOString() },
      { id: '4', name: 'Sacramento, CA', createdAt: new Date().toISOString() },
      { id: '5', name: 'Orange County, CA', createdAt: new Date().toISOString() },
    ]);

    // Sample jobs
    const sampleJobs: Job[] = [
      {
        id: '1',
        title: 'Compassionate Registered Nurse - Home Care',
        description: 'Join our dedicated team of healthcare professionals providing compassionate end-of-life care in patients\' homes. We are seeking an experienced Registered Nurse who is passionate about hospice care and committed to improving the quality of life for patients and their families during challenging times. This role involves comprehensive patient assessment, medication management, pain control, and providing emotional support to both patients and families. You will work closely with an interdisciplinary team including physicians, social workers, chaplains, and home health aides to develop and implement individualized care plans. The ideal candidate will have excellent clinical skills, strong communication abilities, and a deep understanding of palliative care principles. We offer competitive compensation, comprehensive benefits, flexible scheduling, and opportunities for professional development in a supportive work environment.',
        position: 'Registered Nurse',
        location: 'Los Angeles, CA',
        facilities: ['Full-time', 'Benefits', 'Flexible Schedule'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Certified Nursing Assistant - Evening Shift',
        description: 'We are looking for a compassionate Certified Nursing Assistant to join our hospice care team for evening shifts. This position is perfect for someone who wants to make a meaningful difference in the lives of patients and families during their most vulnerable moments. As a CNA, you will provide direct patient care including personal hygiene assistance, mobility support, vital signs monitoring, and companionship. You will work under the supervision of registered nurses and contribute to maintaining detailed patient records. The role requires excellent interpersonal skills, attention to detail, and the ability to work independently while being part of a collaborative healthcare team.',
        position: 'Certified Nursing Assistant',
        location: 'San Francisco, CA',
        facilities: ['Part-time', 'Evening Shift', 'Training Provided'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Licensed Social Worker - Hospice Care',
        description: 'Join our mission-driven organization as a Licensed Social Worker specializing in hospice and palliative care. This role involves providing psychosocial support to patients and families, conducting assessments, developing care plans, and facilitating difficult conversations about end-of-life care. You will collaborate with medical staff, chaplains, and other team members to ensure comprehensive care that addresses not only physical needs but also emotional, social, and spiritual concerns.',
        position: 'Social Worker',
        location: 'San Diego, CA',
        facilities: ['Full-time', 'Remote Options', 'Continuing Education'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Spiritual Care Coordinator - Chaplain',
        description: 'We are seeking a dedicated Chaplain to provide spiritual care and support to hospice patients and their families. This role involves conducting spiritual assessments, providing pastoral care, facilitating memorial services, and offering guidance during times of grief and loss. The ideal candidate will have experience in healthcare chaplaincy, strong listening skills, and the ability to work with people of diverse faith backgrounds.',
        position: 'Chaplain',
        location: 'Orange County, CA',
        facilities: ['Full-time', 'Flexible Schedule', 'Interfaith'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Physical Therapist - Hospice Specialist',
        description: 'Join our team as a Physical Therapist specializing in hospice care. Help patients maintain comfort, mobility, and independence during their end-of-life journey. This position involves conducting assessments, developing treatment plans focused on comfort and quality of life, and providing education to families and caregivers.',
        position: 'Physical Therapist',
        location: 'Sacramento, CA',
        facilities: ['Part-time', 'Contract', 'Professional Development'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setJobs(sampleJobs);

    // Sample applications
    const sampleApplications: JobApplication[] = [
      {
        id: '1',
        jobId: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        appliedPosition: 'Registered Nurse',
        earliestStartDate: '2024-01-15',
        cityState: 'Los Angeles, CA',
        coverLetter: 'I am passionate about providing compassionate care to hospice patients...',
        status: 'waiting',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        additionalDocsUrls: [],
      },
      {
        id: '2',
        jobId: '2',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@email.com',
        phone: '(555) 987-6543',
        appliedPosition: 'Certified Nursing Assistant',
        earliestStartDate: '2024-02-01',
        cityState: 'San Francisco, CA',
        coverLetter: 'With 3 years of experience in healthcare, I am excited to bring my skills...',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        additionalDocsUrls: [],
      },
    ];

    setApplications(sampleApplications);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple authentication check
    if (email === 'admin@hospicecare.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@hospicecare.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    jobs,
    setJobs,
    applications,
    setApplications,
    positions,
    setPositions,
    locations,
    setLocations,
    isLoading,
    setIsLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
