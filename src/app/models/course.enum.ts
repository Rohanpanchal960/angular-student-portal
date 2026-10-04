/**
 * ====================================================================================
 * [EXPERIMENT 5] - Use enums and arrays in TypeScript to display course categories
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * TypeScript me `enum` (Enumeration) ka use named constants ka set banane ke liye hota hai.
 * Yaha hum student courses ke categories ko define kar rahe hain.
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. Enum define karta hai ki course ki value sirf valid options (BCA, MCA, iMCA, BCA_Hons) hi ho sakti hai.
 * 2. Object.values(Course) ya array bana kar hum ise HTML template me <select> dropdown me bind karte hain.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Student registration, admission form, filter aur profile me courses ko standardize
 * karne ke liye ye Enum use hota hai taaki koi invalid course input na ho sake.
 */

export enum Course {
  BCA = 'BCA',
  MCA = 'MCA',
  iMCA = 'iMCA',
  BCA_Hons = 'BCA_Hons'
}

// Course categories ki list jo dropdown menus me bind ki jaayegi
export const COURSE_LIST: Course[] = [
  Course.BCA,
  Course.MCA,
  Course.iMCA,
  Course.BCA_Hons
];

// Course duration & details mapping
export interface CourseDetails {
  name: Course;
  durationYears: number;
  semesterCount: number;
  description: string;
}

export const COURSE_DETAILS_DATA: Record<Course, CourseDetails> = {
  [Course.BCA]: {
    name: Course.BCA,
    durationYears: 3,
    semesterCount: 6,
    description: 'Bachelor of Computer Applications - Core Software Development'
  },
  [Course.MCA]: {
    name: Course.MCA,
    durationYears: 2,
    semesterCount: 4,
    description: 'Master of Computer Applications - Advanced Software & Cloud'
  },
  [Course.iMCA]: {
    name: Course.iMCA,
    durationYears: 5,
    semesterCount: 10,
    description: 'Integrated MCA - 5 Year Comprehensive Computer Science Program'
  },
  [Course.BCA_Hons]: {
    name: Course.BCA_Hons,
    durationYears: 4,
    semesterCount: 8,
    description: 'Bachelor of Computer Applications with Honors (Research & AI)'
  }
};
