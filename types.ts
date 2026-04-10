export enum Unit {
  Atomic = "Unit 1: Atomic Structure and Properties",
  Molecular = "Unit 2: Molecular and Ionic Compound Structure and Properties",
  Intermolecular = "Unit 3: Intermolecular Forces and Properties",
  Reactions = "Unit 4: Chemical Reactions",
  Kinetics = "Unit 5: Kinetics",
  Thermo = "Unit 6: Thermodynamics",
  Equilibrium = "Unit 7: Equilibrium",
  Acids = "Unit 8: Acids and Bases",
  Electro = "Unit 9: Thermodynamics and Electrochemistry"
}

export enum FRQType {
  Short = "Short Answer (4 pts)",
  Long = "Long Answer (10 pts)"
}

export interface SubTopic {
  id: string;
  name: string;
}

export interface UnitData {
  id: Unit;
  name: string;
  subTopics: SubTopic[];
}

export interface FRQMetadata {
  frqType: FRQType;
  frqTypeShort: string;        // "Short", "Long"
  selectedUnits: Unit[];       // Units the user explicitly picked (may be empty)
  selectedSubTopics: string[]; // Topic IDs the user explicitly picked (may be empty)
  actualSubTopics: string[];   // Topic IDs the model reports it actually used
  wasRandom: boolean;          // True if no selection and random fallback was used
}

export interface GeneratedFRQ {
  questionText: string;
  parts: FRQPart[];
  images: string[]; // Base64 or URLs for question diagrams
  scoringGuide: string; // The full scoring guide text
  scoringGuideImages: string[]; // Base64 or URLs for scoring guide diagrams (graphs, tables, FBDs)
  maxPoints: number;
  metadata: FRQMetadata; // Added for PDF generation and storage
}

export interface FRQPart {
  label: string; // (a), (b), etc.
  text: string;
  points: number;
}

export interface AssessmentResult {
  score: number;
  maxScore: number;
  feedback: string;
  breakdown: string;
  extractedResponse?: string; // Per-part verbatim extraction of the student submission
}

export type AppState = 'SELECTION' | 'GENERATING' | 'QUESTION' | 'GRADING' | 'RESULTS';
