/**
 * Codeforces Calendar Integration Tool
 * 
 * This script processes Codeforces contest data and generates .ics calendar files
 * that can be imported into calendar applications.
 */

interface ContestInfo {
  id: string;
  name: string;
  startTime: string;
  duration: string;
  registrationDeadline?: string;
  url: string;
}

class CodeforcesCalendarGenerator {
  
  /**
   * Generates ICS calendar content for Codeforces contests
   */
  static generateICSForContests(contests: ContestInfo[]): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Competitive Companion//Codeforces Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Codeforces Contests
X-WR-CALDESC:Upcoming Codeforces Programming Contests
`;

    contests.forEach(contest => {
      const eventContent = this.generateEventContent(contest);
      icsContent += eventContent;
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
  }

  /**
   * Generates a single contest event in ICS format
   */
  private static generateEventContent(contest: ContestInfo): string {
    const uid = `codeforces-${contest.id}-${Date.now()}@competitive-companion`;
    
    // Parse contest start time (format: "Jun 05, 2025 17:35")
    const startDate = this.parseCodeforcesTime(contest.startTime);
    const duration = this.parseDuration(contest.duration);
    const endDate = new Date(startDate.getTime() + duration);

    const startTimeFormatted = this.formatICSDateTime(startDate);
    const endTimeFormatted = this.formatICSDateTime(endDate);

    return `BEGIN:VEVENT
UID:${uid}
DTSTART:${startTimeFormatted}
DTEND:${endTimeFormatted}
SUMMARY:${this.escapeICSText(contest.name)}
DESCRIPTION:Codeforces Programming Contest\\n\\nRegister and participate at: ${contest.url}\\n\\nDuration: ${contest.duration}
URL:${contest.url}
LOCATION:Online (Codeforces)
CATEGORIES:Programming Contest,Competitive Programming
PRIORITY:5
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Contest starts in 15 minutes!
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Contest starts in 1 hour!
END:VALARM
END:VEVENT
`;
  }

  /**
   * Parses Codeforces time format to JavaScript Date
   */
  private static parseCodeforcesTime(timeStr: string): Date {
    // Handle formats like "Jun 05, 2025 17:35" or relative times
    try {
      // Try parsing as standard format first
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Fallback for relative times or other formats
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
    } catch (error) {
      console.warn('Failed to parse time:', timeStr);
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Parses duration string (e.g., "2:30" = 2 hours 30 minutes)
   */
  private static parseDuration(durationStr: string): number {
    const match = durationStr.match(/(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
    }
    return 2 * 60 * 60 * 1000; // Default 2 hours
  }

  /**
   * Formats Date to ICS DateTime format (YYYYMMDDTHHMMSSZ)
   */
  private static formatICSDateTime(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Escapes special characters for ICS text fields
   */
  private static escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  /**
   * Downloads ICS file in the browser
   */
  static downloadICSFile(icsContent: string, filename: string = 'codeforces-contests.ics'): void {
    if (typeof window !== 'undefined' && window.document) {
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Extracts contest information from Codeforces contests page
   */
  static extractContestsFromHTML(html: string): ContestInfo[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const contests: ContestInfo[] = [];
    
    // Look for the contests table - based on actual Codeforces structure
    const tableSelectors = [
      'table.table-striped tbody tr',
      '.datatable tbody tr', 
      'table tbody tr'
    ];
    
    for (const selector of tableSelectors) {
      const rows = doc.querySelectorAll(selector);
      
      if (rows.length > 0) {
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          
          // Codeforces contest table structure:
          // Column 0: Contest name and link
          // Column 1: Writers 
          // Column 2: Start time
          // Column 3: Duration
          // Column 4: Status (Before start X days)
          // Column 5: Registration status
          
          if (cells.length >= 4) {
            const contestCell = cells[0];
            const contestLink = contestCell.querySelector('a[href*="/contest/"]') as HTMLAnchorElement;
            
            if (contestLink) {
              const href = contestLink.getAttribute('href') || '';
              const contestIdMatch = href.match(/\/contest(?:s)?\/(\d+)/);
              
              if (contestIdMatch) {
                const contestId = contestIdMatch[1];
                const contestName = contestLink.textContent?.trim() || `Contest ${contestId}`;
                const startTimeText = cells[2]?.textContent?.trim() || '';
                const durationText = cells[3]?.textContent?.trim() || '2:00';
                
                // Check if this is an upcoming contest (not past)
                const statusText = cells[4]?.textContent?.trim() || '';
                const isUpcoming = statusText.includes('Before start') || statusText.includes('Before registration');
                
                if (isUpcoming) {
                  const contest: ContestInfo = {
                    id: contestId,
                    name: contestName,
                    startTime: startTimeText,
                    duration: durationText,
                    url: `https://codeforces.com/contest/${contestId}`
                  };
                  
                  contests.push(contest);
                }
              }
            }
          }
        });
        
        // If we found contests with this selector, stop trying others
        if (contests.length > 0) {
          break;
        }
      }
    }
    
    return contests;
  }
}

// For use in browser extension
if (typeof window !== 'undefined') {
  (window as any).CodeforcesCalendarGenerator = CodeforcesCalendarGenerator;
}

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeforcesCalendarGenerator;
}

export default CodeforcesCalendarGenerator;
