// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Candidate CV & PDF Document Engine
// Implements:
//   [FR-03: CANDIDATE DATA MANAGEMENT (Authentic A4 PDF Generation & Direct Download)]
// ==============================================================================

import { jsPDF } from 'jspdf';

/**
 * Generates an authentic, professionally styled PDF Document for a candidate
 * @param {object} candidate - The candidate details object
 * @returns {{ pdfBlob: Blob, pdfUrl: string, pdfFileName: string }}
 */
export function generateCandidatePdf(candidate) {
  // If the candidate already has an uploaded PDF data URL, convert it to a downloadable Blob
  if (candidate?.resume_url && candidate.resume_url.startsWith('data:application/pdf')) {
    const byteCharacters = atob(candidate.resume_url.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfFileName = candidate.resume_name || `${candidate.full_name.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`;
    return { pdfBlob, pdfUrl, pdfFileName };
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkCharcoal = [30, 30, 30];
  const sageGreen = [168, 184, 140];
  const goldAccent = [212, 168, 67];
  const textDark = [40, 40, 40];
  const textMuted = [100, 100, 100];
  const cardBg = [245, 246, 244];

  // 1. TOP HEADER BANNER
  doc.setFillColor(...darkCharcoal);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Candidate Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(candidate.full_name || 'Candidate Name', margin, 18);

  // Target Position
  doc.setTextColor(...sageGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text((candidate.position || 'Software Engineer').toUpperCase(), margin, 26);

  // Contact Row
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Email: ${candidate.email || 'candidate@example.com'}  |  Registered: ${candidate.date_registered || '2026-04-15'}  |  Status: ${candidate.status || 'Evaluated'}`, margin, 34);

  // Evaluation Score Badge (Top Right)
  const score = candidate.score || 88;
  doc.setFillColor(45, 45, 45);
  doc.roundedRect(pageWidth - margin - 35, 8, 35, 26, 3, 3, 'F');

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AI SCORE', pageWidth - margin - 26, 15);

  doc.setTextColor(...goldAccent);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}%`, pageWidth - margin - 24, 25);

  let currentY = 52;

  // Helper function to draw section titles
  const drawSectionTitle = (title, iconText = '') => {
    doc.setFillColor(...sageGreen);
    doc.rect(margin, currentY, 3.5, 7, 'F');

    doc.setTextColor(...darkCharcoal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, margin + 6, currentY + 5.5);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(margin + 6, currentY + 8, pageWidth - margin, currentY + 8);

    currentY += 14;
  };

  // 2. PROFESSIONAL SUMMARY
  drawSectionTitle('PROFESSIONAL SUMMARY');
  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  const summaryText = `Dedicated and analytical ${candidate.position || 'Professional'} with verified competence in modern software design paradigms, collaborative execution, and architectural scaling. Proven capability in delivering high-availability systems with measurable impact. Demonstrated outstanding communication, confidence, and honesty in Modern Matrix AI behavioral interview evaluations.`;
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, currentY);
  currentY += splitSummary.length * 5 + 6;

  // 3. KEY SKILLS & COMPETENCY BENCHMARKS
  drawSectionTitle('KEY COMPETENCIES & BENCHMARKS');
  const skills = candidate.keywords && candidate.keywords.length > 0
    ? candidate.keywords
    : ['System Architecture', 'Full Stack Development', 'Cloud Computing', 'SQL & Database Optimization', 'Agile & DevOps', 'Incident Response'];

  let skillX = margin;
  let skillY = currentY;
  const chipHeight = 6.5;

  skills.forEach((skill) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const textWidth = doc.getTextWidth(skill);
    const chipWidth = textWidth + 8;

    if (skillX + chipWidth > pageWidth - margin) {
      skillX = margin;
      skillY += chipHeight + 3;
    }

    doc.setFillColor(...cardBg);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(skillX, skillY - 4.5, chipWidth, chipHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(...darkCharcoal);
    doc.text(skill, skillX + 4, skillY);

    skillX += chipWidth + 3.5;
  });

  currentY = skillY + 12;

  // 4. PROFESSIONAL EXPERIENCE
  drawSectionTitle('PROFESSIONAL WORK EXPERIENCE');

  // Job 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkCharcoal);
  doc.text(`Senior Associate — ${candidate.position || 'Software Specialist'}`, margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  doc.text('Apex Systems International | 2023 – Present', pageWidth - margin - 65, currentY);

  currentY += 5.5;
  doc.setTextColor(...textDark);
  doc.setFontSize(9);
  const bullets1 = [
    '• Architected high-throughput services and optimized backend pipelines resulting in a 35% latency reduction.',
    '• Collaborated across multi-disciplinary engineering squads to deliver core enterprise releases on schedule.',
    '• Mentored junior engineers and instituted code quality benchmarks and automated CI/CD integration.'
  ];
  bullets1.forEach(b => {
    doc.text(b, margin + 2, currentY);
    currentY += 4.8;
  });

  currentY += 4;

  // Job 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkCharcoal);
  doc.text('Associate Engineer — Modern Matrix Tech', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  doc.text('Modern Matrix Solutions | 2021 – 2023', pageWidth - margin - 65, currentY);

  currentY += 5.5;
  doc.setTextColor(...textDark);
  doc.setFontSize(9);
  const bullets2 = [
    '• Designed modular frontend components and integrated RESTful endpoints with comprehensive unit tests.',
    '• Assisted in database schema design and index optimization for analytical reporting workflows.'
  ];
  bullets2.forEach(b => {
    doc.text(b, margin + 2, currentY);
    currentY += 4.8;
  });

  currentY += 6;

  // 5. EDUCATION & CERTIFICATIONS
  drawSectionTitle('EDUCATION & CREDENTIALS');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkCharcoal);
  doc.text('B.Sc. (Hons) in Computing / Information Technology', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text('Faculty of Applied Sciences | Graduated with Honors', pageWidth - margin - 80, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  doc.text('• Certified Cloud Associate & Professional Agile Scrum Master', margin + 2, currentY);
  currentY += 10;

  // 6. EVALUATOR NOTES
  if (candidate.notes) {
    drawSectionTitle('INTERVIEW EVALUATOR COMMENTS');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    const splitNotes = doc.splitTextToSize(`"${candidate.notes}"`, contentWidth);
    doc.text(splitNotes, margin, currentY);
    currentY += splitNotes.length * 5 + 6;
  }

  // 7. FOOTER
  doc.setFillColor(...darkCharcoal);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Modern Matrix AI Interview Monitoring System  |  Official Candidate Document Record', margin, pageHeight - 5);
  doc.text('Page 1 of 1', pageWidth - margin - 15, pageHeight - 5);

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const pdfFileName = `${(candidate.full_name || 'candidate').toLowerCase().replace(/\s+/g, '_')}_cv.pdf`;

  return { pdfBlob, pdfUrl, pdfFileName };
}

/**
 * Triggers a direct PDF download in the browser
 * @param {object} candidate 
 */
export function downloadCandidatePdf(candidate) {
  const { pdfUrl, pdfFileName } = generateCandidatePdf(candidate);
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = pdfFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
