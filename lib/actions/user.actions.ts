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
    // 1. First get ALL project memberships for the student, regardless of activity
    const projectMembers = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_PROJECT_MEMBERS_COLLECTION_ID!,
      [
        Query.equal('userId', [userId]),
        Query.equal('userRole', ['student']),
        Query.equal('status', ['active']) // Only active memberships
      ]
    );

    // Early return if student has no project memberships at all
    if (projectMembers.documents.length === 0) {
      return parseStringify({
        totalProjects: 0,
        activeProjects: 0,
        projectHours: [],
        totalMonthlyHours: 0
      });
    }

    // 2. Get ALL projects the student is a member of
    const projectIds = Array.from(
      new Set(
        projectMembers.documents
          .map(pm => pm.projectId)
          .filter(id => id !== undefined)
      )
    );
    
    const projects = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_PROJECTS_COLLECTION_ID!,
      [Query.equal('projectId', projectIds)]
    );

    // 3. Get attendance records for current month
    const attendance = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [
        Query.equal('studentId', [userId]),
        Query.greaterThanEqual('scheduledStartTime', [firstDayOfMonth.toISOString()]),
        Query.lessThanEqual('scheduledStartTime', [currentDate.toISOString()]),
        Query.equal('verificationStatus', ['verified']),
        Query.equal('attendanceStatus', ['present'])
      ]
    );

    // 4. Get shifts data for attendance records
    const shiftIds = attendance.documents.map(a => a.shiftId).filter(id => id !== undefined);
    let shifts: Shift[] = [];
    
    if (shiftIds.length > 0) {
      const shiftsResponse = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_SHIFTS_COLLECTION_ID!,
        [Query.equal('shiftId', shiftIds)]
      );
      shifts = shiftsResponse.documents as unknown as Shift[];
    }

    // 5. Calculate hours for ALL projects (including those with zero hours)
    const projectHours: ProjectTimeStats[] = projects.documents.map((project, index) => {
      try {
        const projectAttendance = attendance.documents.filter(record => {
          const relatedShift = shifts.find(s => s.shiftId === record.shiftId);
          return relatedShift && relatedShift.projectId === project.projectId;
        });

        const totalHours = projectAttendance.reduce((sum, record) => {
          // Ensure we're using the tracked hours from attendance record
          return sum + (Number(record.trackedHours) || 0);
        }, 0);

        return {
          projectId: project.projectId,
          projectName: project.name,
          trackedHours: Math.round(totalHours * 100) / 100,
          color: [`#0747b6`, `#2265d8`, `#2f91fa`][index % 3]
        };
      } catch (error) {
        console.error(`Error calculating hours for project ${project.projectId}:`, error);
        return {
          projectId: project.projectId,
          projectName: project.name,
          trackedHours: 0,
          color: [`#0747b6`, `#2265d8`, `#2f91fa`][index % 3]
        };
      }
    });

    // 6. Calculate total monthly hours from all projects with tracked time
    const totalMonthlyHours = projectHours.reduce((sum, p) => sum + p.trackedHours, 0);

    // 7. Return complete stats
    return parseStringify({
      // Include ALL projects in counts, regardless of hours
      totalProjects: projects.documents.length,
      activeProjects: projects.documents.filter(p => p.status === 'active').length,
      // Only include projects with tracked hours in the projectHours array
      projectHours: projectHours.filter(p => p.trackedHours > 0),
      totalMonthlyHours: Math.round(totalMonthlyHours * 100) / 100
    });

  } catch (error) {
    console.error('Error calculating student project stats:', error);
    return parseStringify({
      totalProjects: 0,
      activeProjects: 0,
      projectHours: [],
      totalMonthlyHours: 0
    });
  }
}