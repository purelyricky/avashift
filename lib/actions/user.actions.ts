'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/actions/appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

const getCollectionIdForRole = (role: UserRole) => {
  switch (role) {
    case 'admin': return process.env.APPWRITE_ADMINS_COLLECTION_ID;
    case 'client': return process.env.APPWRITE_CLIENTS_COLLECTION_ID;
    case 'student': return process.env.APPWRITE_STUDENTS_COLLECTION_ID;
    case 'shiftLeader': return process.env.APPWRITE_SHIFT_LEADERS_COLLECTION_ID;
    case 'gateman': return process.env.APPWRITE_GATEMEN_COLLECTION_ID;
    default: throw new Error('Invalid role');
  }
};

const findUserInCollection = async (database: any, email: string) => {
  const collections = [
    { id: process.env.APPWRITE_ADMINS_COLLECTION_ID!, role: 'admin' as UserRole },
    { id: process.env.APPWRITE_CLIENTS_COLLECTION_ID!, role: 'client' as UserRole },
    { id: process.env.APPWRITE_STUDENTS_COLLECTION_ID!, role: 'student' as UserRole },
    { id: process.env.APPWRITE_SHIFT_LEADERS_COLLECTION_ID!, role: 'shiftLeader' as UserRole },
    { id: process.env.APPWRITE_GATEMEN_COLLECTION_ID!, role: 'gateman' as UserRole },
  ];

  for (const collection of collections) {
    try {
      const response = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        collection.id,
        [Query.equal('email', [email])]
      );

      if (response.documents.length > 0) {
        return {
          ...response.documents[0],
          role: collection.role
        };
      }
    } catch (error) {
      console.error(`Error checking collection ${collection.id}:`, error);
    }
  }

  return null;
};

export const signUp = async ({ role, ...userData }: SignUpWithRoleData) => {
  const { email, password, firstName, lastName, phone } = userData;
  
  try {
    const { account, database } = await createAdminClient();

    // Create Appwrite account
    const newAccount = await account.create(
      ID.unique(), 
      email, 
      password, 
      `${firstName} ${lastName}`
    );

    // Base user data that's common to all roles
    const baseUserData = {
      userId: newAccount.$id,
      role, // Direct role assignment
      firstName,
      lastName,
      email,
      phone: phone || null,
      createdAt: new Date().toISOString()
    };

    // Add role-specific fields
    const additionalFields: Record<UserRole, object> = {
      student: {
        dateOfBirth: null,
        availabilityStatus: 'active',
        punctualityScore: 100.0,
        rating: 5.0
      },
      admin: {},
      client: {},
      shiftLeader: {},
      gateman: {
        clientId: null
      }
    };

    // Create user document in appropriate collection
    const collectionId = getCollectionIdForRole(role);
    await database.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      collectionId!,
      ID.unique(),
      {
        ...baseUserData,
        ...additionalFields[role]
      }
    );

    return true;
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
};

export const signIn = async ({ email, password }: LoginUser) => {
  try {
    const { account, database } = await createAdminClient();
    
    // Create session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Find user data in collections using email
    const userData = await findUserInCollection(database, email);
    
    if (!userData) {
      throw new Error('User not found');
    }

    // Set session cookie
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Return user data including role
    return {
      ...userData,
      role: userData.role
    };
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
};

//Get Logged In user

export async function getUserInfo({ userId }: getUserInfoProps): Promise<UserResponse> {
    try {
      const { database } = await createAdminClient();
      
      const collections = [
        { id: process.env.APPWRITE_ADMINS_COLLECTION_ID!, role: 'admin' as UserRole },
        { id: process.env.APPWRITE_CLIENTS_COLLECTION_ID!, role: 'client' as UserRole },
        { id: process.env.APPWRITE_STUDENTS_COLLECTION_ID!, role: 'student' as UserRole },
        { id: process.env.APPWRITE_SHIFT_LEADERS_COLLECTION_ID!, role: 'shiftLeader' as UserRole },
        { id: process.env.APPWRITE_GATEMEN_COLLECTION_ID!, role: 'gateman' as UserRole },
      ];
  
      for (const collection of collections) {
        try {
          const response = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            collection.id,
            [Query.equal('userId', [userId])]
          );
  
          if (response.documents.length > 0) {
            const doc = response.documents[0];
            
            // Create base user data from document
            const baseUserData: BaseUser = {
              userId: doc.userId,
              role: collection.role,
              firstName: doc.firstName,
              lastName: doc.lastName,
              email: doc.email,
              phone: doc.phone || null,
              createdAt: doc.$createdAt
            };
  
            let userData: User;
            
            if (collection.role === 'student') {
              userData = {
                ...baseUserData,
                role: 'student',
                dateOfBirth: doc.dateOfBirth || null,
                availabilityStatus: doc.availabilityStatus || 'inactive',
                punctualityScore: Number(doc.punctualityScore) || 100,
                rating: Number(doc.rating) || 5.0
              } as StudentUser;
            } else if (collection.role === 'gateman') {
              userData = {
                ...baseUserData,
                role: 'gateman',
                clientId: doc.clientId || null
              } as GatemanUser;
            } else {
              userData = baseUserData;
            }
  
            return parseStringify({
              status: 'success',
              data: userData
            });
          }
        } catch (error) {
          console.error(`Error checking collection ${collection.id}:`, error);
          continue;
        }
      }
  
      return parseStringify({
        status: 'error',
        data: null,
        message: 'User not found'
      });
    } catch (error) {
      console.error('Error in getUserInfo:', error);
      return parseStringify({
        status: 'error',
        data: null,
        message: 'Internal server error'
      });
    }
  }
  
  export async function getLoggedInUser(): Promise<UserResponse> {
    try {
      const { account } = await createSessionClient();
      
      const currentUser = await account.get();
      
      if (!currentUser) {
        return parseStringify({
          status: 'error',
          data: null,
          message: 'No user session found'
        });
      }
  
      return await getUserInfo({ userId: currentUser.$id });
    } catch (error) {
      console.error('Error in getLoggedInUser:', error);
      return parseStringify({
        status: 'error',
        data: null,
        message: 'Failed to get logged in user'
      });
    }
  }

//Function for Getting Logged In User End

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete('appwrite-session');
    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
};

// ========================================
// Calculation Actions
// ========================================

export async function getStudentProjectStats(userId: string): Promise<StudentProjectStats> {
    const { database } = await createAdminClient();
    
    // Use UTC dates to ensure consistent timezone handling
    const currentDate = new Date();
    const firstDayOfMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));
  
    try {
      // Get all projects the student is a member of
      const projectMembers = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_PROJECT_MEMBERS_COLLECTION_ID!,
        [
          Query.equal('userId', [userId]),
          Query.equal('userRole', ['student']),
          Query.equal('status', ['active'])
        ]
      );
  
      // Early return for students with no projects
      if (projectMembers.documents.length === 0) {
        return parseStringify({
          totalProjects: 0,
          activeProjects: 0,
          projectEarnings: [],
          totalMonthlyEarnings: 0
        });
      }
  
      // Extract unique project IDs using Array.from and filter
      const projectIds = Array.from(
        new Set(
          projectMembers.documents
            .map(pm => pm.projectId)
            .filter(id => id !== undefined)
        )
      );
      
      // Get project details
      const projects = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_PROJECTS_COLLECTION_ID!,
        [Query.equal('projectId', projectIds)]
      );
  
      // Get earnings for current month
      const earnings = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_EARNINGS_COLLECTION_ID!,
        [
          Query.equal('studentId', [userId]),
          Query.greaterThanEqual('createdAt', [firstDayOfMonth.toISOString()]),
          Query.lessThanEqual('createdAt', [currentDate.toISOString()]),
          Query.equal('status', ['verified', 'paid']) // Only count verified or paid earnings
        ]
      );
  
      // Fetch shifts data only if there are earnings
      const shiftIds = earnings.documents.map(e => e.shiftId).filter(id => id !== undefined);
      let shifts: Shift[] = [];
      
      if (shiftIds.length > 0) {
        const shiftsResponse = await database.listDocuments(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_SHIFTS_COLLECTION_ID!,
          [Query.equal('shiftId', shiftIds)]
        );
        shifts = shiftsResponse.documents as unknown as Shift[];
      }
  
      // Calculate earnings per project with error handling
      const projectEarnings: ProjectEarning[] = projects.documents.map((project, index) => {
        try {
          const projectEarnings = earnings.documents
            .filter(earning => {
              const relatedShift = shifts.find(s => s.shiftId === earning.shiftId);
              return relatedShift && relatedShift.projectId === project.projectId;
            })
            .reduce((sum, earning) => {
              // Ensure we're dealing with valid numbers
              const amount = Number(earning.totalAmount) || 0;
              return sum + amount;
            }, 0);
  
          return {
            projectId: project.projectId,
            projectName: project.name,
            totalEarnings: Math.round(projectEarnings * 100) / 100, // Round to 2 decimal places
            color: [`#0747b6`, `#2265d8`, `#2f91fa`][index % 3]
          };
        } catch (error) {
          console.error(`Error calculating earnings for project ${project.projectId}:`, error);
          return {
            projectId: project.projectId,
            projectName: project.name,
            totalEarnings: 0,
            color: [`#0747b6`, `#2265d8`, `#2f91fa`][index % 3]
          };
        }
      });
  
      const totalMonthlyEarnings = projectEarnings.reduce((sum, p) => sum + p.totalEarnings, 0);
  
      return parseStringify({
        totalProjects: projects.documents.length,
        activeProjects: projects.documents.filter(p => p.status === 'active').length,
        projectEarnings: projectEarnings.filter(p => p.totalEarnings > 0),
        totalMonthlyEarnings: Math.round(totalMonthlyEarnings * 100) / 100 // Round to 2 decimal places
      });
  
    } catch (error) {
      console.error('Error calculating student project stats:', error);
      return parseStringify({
        totalProjects: 0,
        activeProjects: 0,
        projectEarnings: [],
        totalMonthlyEarnings: 0
      });
    }
}

// Helper function with improved date handling
export async function calculateTimeAndEarnings(
    scheduledStart: string,
    scheduledEnd: string,
    actualStart: string | null,
    actualEnd: string | null
): Promise<TimeCalculation> {
    if (!actualStart || !actualEnd) {
      return { trackedHours: 0, lostHours: 0 };
    }

    try {
        // Convert all times to minutes since midnight with timezone handling
        const getMinutes = (timeStr: string) => {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date string');
            }
            return date.getHours() * 60 + date.getMinutes();
        };

        const schedStart = getMinutes(scheduledStart);
        const schedEnd = getMinutes(scheduledEnd);
        const actStart = getMinutes(actualStart);
        const actEnd = getMinutes(actualEnd);

        // Calculate lost hours with validation
        const lostStart = Math.max(0, (actStart - schedStart)) / 60;
        const lostEnd = Math.max(0, (schedEnd - actEnd)) / 60;
        const totalLost = Math.round((lostStart + lostEnd) * 100) / 100;

        // Calculate tracked hours with validation
        const trackedStart = Math.max(schedStart, actStart);
        const trackedEnd = Math.min(schedEnd, actEnd);
        const trackedHours = Math.max(0, Math.round((trackedEnd - trackedStart) / 60 * 100) / 100);

        return {
            trackedHours,
            lostHours: totalLost
        };
    } catch (error) {
        console.error('Error calculating time and earnings:', error);
        return { trackedHours: 0, lostHours: 0 };
    }
}