import { Student } from './student.model';
import { Course } from './course.enum';

/**
 * ====================================================================================
 * [EXPERIMENT 27] - Write a unit test for a simple component / model method
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Jasmine + Karma test suite jo `Student.getFullName(firstName, lastName)` method
 * ko strictly test karti hai.
 * 
 * [SYLLABUS REQUIREMENT]:
 * "27. Write a unit test for a simple component method
 *  Example: Test a method getFullName() that returns 'Raj Patel' from first and last name."
 */

describe('Student Model & Method Unit Tests [Experiment 27]', () => {
  it('should return "Raj Patel" from first name "Raj" and last name "Patel"', () => {
    // Calling the method under test
    const fullName = Student.getFullName('Raj', 'Patel');
    
    // Expectation as required in syllabus experiment 27
    expect(fullName).toBe('Raj Patel');
  });

  it('should handle whitespace properly in getFullName', () => {
    const fullName = Student.getFullName('  Amit ', ' Shah ');
    expect(fullName).toBe('Amit Shah');
  });

  it('should return single name if last name is missing', () => {
    const fullName = Student.getFullName('Neha', '');
    expect(fullName).toBe('Neha');
  });

  it('should calculate grade correctly: marks >= 40 is pass', () => {
    const passedStudent = new Student(101, 'Neha', Course.MCA, 88);
    expect(passedStudent.isPassed()).toBeTrue();
    expect(passedStudent.getGrade()).toBe('A+');

    const failedStudent = new Student(104, 'Raj Patel', Course.iMCA, 35);
    expect(failedStudent.isPassed()).toBeFalse();
    expect(failedStudent.getGrade()).toBe('F');
  });
});
