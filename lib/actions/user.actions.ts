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

function calculateHours(
  scheduledStart: Date,
  scheduledEnd: Date,
  actualStart: Date,
  actualEnd: Date
): { trackedHours: number; lostHours: number } {
  // Convert all times to minutes since epoch to properly handle dates
  const toMinutes = (date: Date) => date.getTime() / (1000 * 60);
  
  const schedStart = toMinutes(scheduledStart);
  const schedEnd = toMinutes(scheduledEnd);
  const actStart = toMinutes(actualStart);
  const actEnd = toMinutes(actualEnd);

  // Calculate tracked hours
  const trackedStart = Math.max(schedStart, actStart);
  const trackedEnd = Math.min(schedEnd, actEnd);
  const trackedHours = Math.max(0, (trackedEnd - trackedStart) / 60);

  // Calculate lost hours
  const lostStart = Math.max(0, (actStart - schedStart) / 60);
  const lostEnd = Math.max(0, (schedEnd - actEnd) / 60);
  const lostHours = lostStart + lostEnd;

  // Debugging statements
  console.log({
    scheduledStart: scheduledStart.toISOString(),
    scheduledEnd: scheduledEnd.toISOString(),
    actualStart: actualStart.toISOString(),
    actualEnd: actualEnd.toISOString(),
    trackedHours,
    lostHours
  });

  return { trackedHours, lostHours };
}

export async function getStudentProjectStats(userId: string): Promise<StudentProjectStats> {
  const { database } = await createAdminClient();
  
  // Use UTC dates to ensure consistent timezone handling
  const currentDate = new Date();
  const firstDayOfMonth = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1));

  try {
    // 1. Get ALL project memberships for the student
    const projectMembers = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_PROJECT_MEMBERS_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    if (projectMembers.documents.length === 0) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        projectHours: [],
        totalMonthlyHours: 0,
        totalLostHours: 0
      };
    }

    // 2. Get ALL projects
    const projectIds = Array.from(new Set(projectMembers.documents.map(pm => pm.projectId)));
    const projects = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_PROJECTS_COLLECTION_ID!,
      [Query.equal('projectId', projectIds)]
    );

    // Filter active projects
    const activeProjects = projects.documents.filter(project => 
      project.status === 'active' && 
      projectMembers.documents.some(pm => pm.projectId === project.projectId && pm.status === 'active')
    );

    // 3. Get all shifts for these projects in the current month
    const shifts = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_SHIFTS_COLLECTION_ID!,
      [
        Query.equal('projectId', projectIds),
        Query.greaterThanEqual('date', [firstDayOfMonth.toISOString()]),
        Query.lessThanEqual('date', [currentDate.toISOString()])
      ]
    );

    // 4. Get completed assignments
    const shiftIds = shifts.documents.map(s => s.shiftId);
    const shiftAssignments = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_SHIFT_ASSIGNMENTS_COLLECTION_ID!,
      [
        Query.equal('studentId', [userId]),
        Query.equal('shiftId', shiftIds),
        Query.equal('status', ['completed'])
      ]
    );

    // 5. Get attendance records
    const assignmentShiftIds = shiftAssignments.documents.map(sa => sa.shiftId);
    const attendance = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_ATTENDANCE_COLLECTION_ID!,
      [
        Query.equal('studentId', [userId]),
        Query.equal('shiftId', assignmentShiftIds),
        Query.equal('attendanceStatus', ['present'])
      ]
    );

    // Calculate project hours
    const projectHours: ProjectTimeStats[] = [];
    const colors = ['#0747b6', '#2265d8', '#2f91fa'];

    for (const project of projects.documents) {
      const projectShifts = shifts.documents.filter(s => s.projectId === project.projectId);
      let totalTrackedHours = 0;
      let totalLostHours = 0;

      for (const shift of projectShifts) {
        const attendanceRecord = attendance.documents.find(a => a.shiftId === shift.shiftId);
        
        if (attendanceRecord?.clockInTime && attendanceRecord?.clockOutTime) {
          try {
            // Ensure all dates are properly parsed
            const { trackedHours, lostHours } = calculateHours(
              new Date(shift.startTime),
              new Date(shift.stopTime),
              new Date(attendanceRecord.clockInTime),
              new Date(attendanceRecord.clockOutTime)
            );

            console.log(`Shift ${shift.shiftId} calculations:`, {
              trackedHours,
              lostHours,
              shift: shift.startTime,
              attendance: attendanceRecord.clockInTime
            });

            totalTrackedHours += trackedHours;
            totalLostHours += lostHours;
          } catch (error) {
            console.error(`Error calculating hours for shift ${shift.shiftId}:`, error);
          }
        }
      }

      if (totalTrackedHours > 0 || totalLostHours > 0) {
        projectHours.push({
          projectId: project.projectId,
          projectName: project.name,
          trackedHours: Math.round(totalTrackedHours * 100) / 100,
          lostHours: Math.round(totalLostHours * 100) / 100,
          color: colors[projectHours.length % colors.length]
        });
      }
    }

    const totalMonthlyHours = projectHours.reduce((sum, p) => sum + p.trackedHours, 0);
    const totalLostHours = projectHours.reduce((sum, p) => sum + p.lostHours, 0);

    return {
      totalProjects: projects.documents.length,
      activeProjects: activeProjects.length,
      projectHours,
      totalMonthlyHours: Math.round(totalMonthlyHours * 100) / 100,
      totalLostHours: Math.round(totalLostHours * 100) / 100
    };

  } catch (error) {
    console.error('Error calculating student project stats:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      projectHours: [],
      totalMonthlyHours: 0,
      totalLostHours: 0
    };
  }
}