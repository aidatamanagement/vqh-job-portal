import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ParsedJobData {
  title?: string;
  description?: string;
  position?: string;
  location?: string;
  facilities?: string[];
  isUrgent?: boolean;
  applicationDeadline?: string;
  hrManagerId?: string;
}

export function useDocumentParser() {
  const [isParsingDocument, setIsParsingDocument] = useState(false);

  // Extract text from different file types
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await file.text();
      } 
      
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // For PDF files, we'll need to use a PDF parsing library
        // For now, let's return a placeholder - we'll implement this with a proper PDF parser
        toast({
          title: "PDF Support Coming Soon",
          description: "PDF parsing will be available in the next update. Please use text files for now.",
          variant: "destructive",
        });
        throw new Error('PDF parsing not yet implemented');
      }

      if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        // For Word documents, we'll need a document parser
        toast({
          title: "Word Document Support Coming Soon", 
          description: "Word document parsing will be available in the next update. Please use text files for now.",
          variant: "destructive",
        });
        throw new Error('Word document parsing not yet implemented');
      }

      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('Text extraction error:', error);
      throw error;
    }
  };

  // AI-powered job data extraction
  const parseJobDataWithAI = async (text: string): Promise<ParsedJobData> => {
    const prompt = `
    Please extract structured job posting data from the following text. Return a JSON object with these fields:
    
    {
      "title": "Job title",
      "description": "Full job description (preserve formatting if possible)",
      "position": "Job category/position type (e.g., 'Nurse', 'Administrator', 'Social Worker')",
      "location": "Job location (e.g., 'Remote', 'New York, NY', 'On-site')",
      "facilities": ["Array of employment benefits, requirements, or job types like 'Full-time', 'Part-time', 'Health Insurance', 'Remote Work', etc."],
      "isUrgent": boolean (true if job is marked as urgent/immediate need),
      "applicationDeadline": "ISO date string if deadline is mentioned, null otherwise"
    }
    
    Extract only the information that is clearly present in the text. If something is not mentioned, omit it or use null/empty values.
    
    Text to parse:
    ${text}
    `;

    try {
      // For now, we'll simulate AI parsing with a timeout
      // In production, you would call OpenAI, Claude, or another AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate extracted data based on common patterns
      const simulatedParsing = simulateJobDataExtraction(text);
      
      return simulatedParsing;
    } catch (error) {
      console.error('AI parsing error:', error);
      throw new Error('Failed to parse job data with AI');
    }
  };

  // Temporary simulation function until we implement real AI parsing
  const simulateJobDataExtraction = (text: string): ParsedJobData => {
    const lines = text.toLowerCase().split('\n');
    const fullText = text.toLowerCase();
    
    const extracted: ParsedJobData = {};

    // Try to extract title (usually first line or line with "title", "position")
    const titleLine = lines.find(line => 
      line.includes('title:') || 
      line.includes('position:') ||
      line.includes('job:')
    );
    if (titleLine) {
      extracted.title = titleLine.split(':')[1]?.trim() || lines[0];
    } else {
      // Use first non-empty line as title
      extracted.title = lines.find(line => line.trim().length > 0) || '';
    }

    // Extract location
    const locationKeywords = ['location:', 'where:', 'remote', 'on-site', 'hybrid'];
    const locationLine = lines.find(line => 
      locationKeywords.some(keyword => line.includes(keyword))
    );
    if (locationLine) {
      if (fullText.includes('remote')) extracted.location = 'Remote';
      else if (fullText.includes('on-site') || fullText.includes('onsite')) extracted.location = 'On-site';
      else if (fullText.includes('hybrid')) extracted.location = 'Hybrid';
      else extracted.location = locationLine.split(':')[1]?.trim() || 'On-site';
    }

    // Extract position/category
    const positionKeywords = ['nurse', 'administrator', 'social worker', 'therapist', 'coordinator'];
    const foundPosition = positionKeywords.find(pos => fullText.includes(pos));
    if (foundPosition) {
      extracted.position = foundPosition.charAt(0).toUpperCase() + foundPosition.slice(1);
    }

    // Extract facilities/benefits
    const facilities = [];
    if (fullText.includes('full-time') || fullText.includes('full time')) facilities.push('Full-time');
    if (fullText.includes('part-time') || fullText.includes('part time')) facilities.push('Part-time');
    if (fullText.includes('health insurance')) facilities.push('Health Insurance');
    if (fullText.includes('401k') || fullText.includes('retirement')) facilities.push('401(k)');
    if (fullText.includes('pto') || fullText.includes('paid time off')) facilities.push('Paid Time Off');
    if (fullText.includes('flexible') || fullText.includes('flex')) facilities.push('Flexible Schedule');
    extracted.facilities = facilities;

    // Check if urgent
    extracted.isUrgent = fullText.includes('urgent') || 
                        fullText.includes('immediate') || 
                        fullText.includes('asap') ||
                        fullText.includes('emergency');

    // Extract application deadline
    const deadlineKeywords = ['deadline:', 'apply by', 'applications due', 'closing date'];
    const deadlineLine = lines.find(line => 
      deadlineKeywords.some(keyword => line.includes(keyword))
    );
    if (deadlineLine) {
      // Extract date from the deadline line
      const dateMatch = deadlineLine.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i) ||
                       deadlineLine.match(/\d{1,2}\/\d{1,2}\/\d{4}/) ||
                       deadlineLine.match(/\d{4}-\d{2}-\d{2}/);
      
      if (dateMatch) {
        try {
          const extractedDate = new Date(dateMatch[0]);
          if (!isNaN(extractedDate.getTime())) {
            // Convert to ISO datetime-local format (YYYY-MM-DDTHH:MM)
            extracted.applicationDeadline = extractedDate.toISOString().slice(0, 16);
          }
        } catch (error) {
          console.warn('Could not parse deadline date:', dateMatch[0]);
        }
      }
    }

    // Extract clean job description (exclude metadata lines)
    const metadataKeywords = [
      'job title:', 'title:', 'position:', 'location:', 'employment type:', 
      'benefits package:', 'application deadline:', 'apply by', 'urgent'
    ];
    
    // Find where the actual job description starts
    let descriptionStart = 0;
    let descriptionEnd = lines.length;
    
    // Skip metadata lines at the beginning
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (line === 'job description:' || line.includes('about the role:') || line.includes('we are seeking')) {
        descriptionStart = i;
        break;
      }
      if (line && !metadataKeywords.some(keyword => line.includes(keyword)) && line.length > 20) {
        // Found first substantial content line
        descriptionStart = i;
        break;
      }
    }
    
    // Find where description ends (before benefits/deadline sections)
    for (let i = descriptionStart + 1; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (line.includes('benefits package:') || 
          line.includes('application deadline:') || 
          line.includes('apply by') ||
          line.includes('this is an urgent')) {
        descriptionEnd = i;
        break;
      }
    }
    
    // Extract and clean the description
    const descriptionLines = lines.slice(descriptionStart, descriptionEnd)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Remove the "Job Description:" header if it exists
    if (descriptionLines[0] && descriptionLines[0].toLowerCase().includes('job description:')) {
      descriptionLines.shift();
    }
    
    extracted.description = descriptionLines.join('\n\n').trim();

    return extracted;
  };

  const parseDocument = async (file: File): Promise<ParsedJobData> => {
    setIsParsingDocument(true);
    
    try {
      // Step 1: Extract text from file
      const extractedText = await extractTextFromFile(file);
      
      if (!extractedText.trim()) {
        throw new Error('No text could be extracted from the document');
      }

      // Step 2: Parse with AI
      const parsedData = await parseJobDataWithAI(extractedText);
      
      toast({
        title: "Document Parsed Successfully",
        description: "Job data has been extracted. Review and confirm the details below.",
      });

      return parsedData;
    } catch (error) {
      console.error('Document parsing error:', error);
      toast({
        title: "Parsing Failed",
        description: error instanceof Error ? error.message : "Failed to parse document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsParsingDocument(false);
    }
  };

  return {
    parseDocument,
    isParsingDocument,
  };
} 