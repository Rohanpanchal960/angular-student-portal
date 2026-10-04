import { Pipe, PipeTransform } from '@angular/core';

/**
 * ====================================================================================
 * [EXPERIMENT 12] - Create a custom pipe to abbreviate full names
 * ====================================================================================
 * 
 * [KYA KARTA HAI YE CODE?]:
 * Ye ek custom Angular Pipe hai jiska naam 'abbreviate' hai.
 * Ye kisi bhi full name ko uske initials/abbreviations me transform karta hai.
 * 
 * [INPUT & OUTPUT EXAMPLES]:
 * Input: "Sonal K Patel"  --> Output: "S.K.P."
 * Input: "Amit Kumar Shah" --> Output: "A.K.S."
 * Input: "Neha"           --> Output: "N."
 * 
 * [KAISE KAAM KARTA HAI?]:
 * 1. String ko spaces se split karta hai words array me.
 * 2. Har word ka pehla letter nikal kar uppercase karta hai aur '.' append karta hai.
 * 3. Sabhi initials ko join karke final string return karta hai.
 * 
 * [STUDENT MANAGEMENT SYSTEM ME CONNECTION]:
 * Student ID Cards, avatar initials, ya compact list view me student ka short
 * name display karne ke liye ye custom pipe use hota hai:
 * Example template usage: `{{ student.name | abbreviate }}`
 */

@Pipe({
  name: 'abbreviate',
  standalone: true
})
export class AbbreviatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') {
      return '';
    }

    // Split name by one or more whitespace characters
    const parts = value.trim().split(/\s+/);
    if (parts.length === 0 || parts[0] === '') {
      return '';
    }

    // Map each part to its first uppercase letter followed by dot
    const initials = parts.map(part => {
      const cleanPart = part.replace(/[^a-zA-Z]/g, '');
      return cleanPart ? cleanPart.charAt(0).toUpperCase() + '.' : '';
    }).filter(char => char !== '');

    return initials.join('');
  }
}
