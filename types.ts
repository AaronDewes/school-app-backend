export type userDocument = {
    hashedPassword: string;
    username: string;
    email: string;
    role?: "student" | "teacher" | "admin";
}

export type personalData = {
    // If it's a student, the subjects they chose
    // For teachers, it's the subjects they teach 
    subjects?: string[];
    // Only for students
    class?: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
}
