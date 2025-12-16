
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedFRQ, AssessmentResult, FRQType, Unit } from '../types';
import { FRQ_POINT_TOTALS, UNITS } from '../constants';

// Helper to get short FRQ type code
const getFRQTypeShort = (type: FRQType): string => {
  switch (type) {
    case FRQType.Short: return "Short";
    case FRQType.Long: return "Long";
    default: return "FRQ";
  }
};

// Get API key from runtime config (for Cloud Run) or environment variables
const getApiKey = (): string => {
  // Check runtime config first (injected by docker-entrypoint.sh)
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__?.FRQ) {
    return (window as any).__RUNTIME_CONFIG__.FRQ;
  }

  // Fallback to environment variables with FRQ as fallback
  return process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.FRQ || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// We use the Thinking model for complex chemistry generation
const MODEL_NAME = 'gemini-3-pro-preview';
const VISION_MODEL_NAME = 'gemini-3-pro-preview'; 
const IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';

export const generateFRQ = async (
  type: FRQType,
  unit: Unit,
  selectedSubTopics: string[]
): Promise<GeneratedFRQ> => {
  
  // Calculate excluded topics based on what was selected
  const unitData = UNITS.find(u => u.id === unit);
  const allSubTopics = unitData ? unitData.subTopics.map(s => s.id) : [];
  const excludedSubTopics = allSubTopics.filter(id => !selectedSubTopics.includes(id));
  
  const subTopicInstruction = excludedSubTopics.length > 0 
    ? `IMPORTANT: EXCLUDE the following sub-topics from the question content: ${excludedSubTopics.join(', ')}. Focus ONLY on the selected sub-topics.` 
    : "You may include any relevant sub-topics within this unit.";

  const totalPoints = FRQ_POINT_TOTALS[type];

  const prompt = `
    You are an expert AP Chemistry exam writer.
    Create a unique, college-level Free Response Question (FRQ) of type "${type}" for "${unit}".
    ${subTopicInstruction}

    Adhere strictly to the College Board style for AP Chemistry.

    TOTAL POINTS FOR THIS QUESTION: ${totalPoints}.
    Distribute these points reasonably among the parts.

    Specifics for ${type}:
    ${type === FRQType.Short ? "- Short Answer (4 pts): Focus on a specific phenomenon (e.g., periodic trends, single reaction stoichiometry) or a specific lab data analysis. Requires concise explanations or calculations. Typically 2-3 parts." : ""}
    ${type === FRQType.Long ? "- Long Answer (10 pts): Multipart question (parts a-d or a-e). Must integrate multiple sub-topics (e.g., stoichiometry followed by thermodynamics, or equilibrium followed by acid-base). Often includes drawing Lewis structures, interpreting PES data, or analyzing particulate diagrams. Typically 4-5 parts." : ""}

    IMPORTANT FORMATTING RULES:
    - **Math:** Use LaTeX for ALL mathematical expressions, variables, and equations. Wrap them in single dollar signs (e.g., $K_a = \\frac{[H^+][A^-]}{[HA]}$).
    - **Chemical Equations:** Use proper LaTeX formatting with \\text{} for chemical formulas (e.g., $\\text{H}_2\\text{O}(l)$, $\\text{NaCl}(aq) \\rightarrow \\text{Na}^+(aq) + \\text{Cl}^-(aq)$).
    - **Tables:** Use standard Markdown table syntax (e.g., | x | y | ...). Ensure columns are aligned.
    - **Scoring Guide:** Format with extensive whitespace for readability. Follow this EXACT structure:

      Example Scoring Guide Format:

      ---

      ### Part (a) [3 points]

      **1 point** — For correctly identifying the Lewis structure with all lone pairs shown:

      The structure shows $\\text{NH}_3$ with one lone pair on nitrogen.


      **1 point** — For identifying the molecular geometry:

      Trigonal pyramidal


      **1 point** — For explaining the bond angle:

      The bond angle is approximately 107° due to lone pair repulsion.


      ---

      ### Part (b) [2 points]

      **1 point** — For setting up the equilibrium expression...

      KEY FORMATTING REQUIREMENTS:
      - Use THREE blank lines between each scoring criterion
      - Use horizontal rules (---) to separate parts
      - Format point values as bold: **1 point** — Description
      - Put mathematical expressions on their own lines with blank lines above and below
      - Add extra blank line before each new Part heading
      - When showing visual aids (particulate diagrams, Lewis structures, reaction coordinate diagrams, titration curves) in scoring guide, reference them as "See Figure X" and provide detailed image prompts

    STRUCTURE REQUIREMENTS (JSON):
    - "usedSubTopics": An array of strings containing the IDs (e.g. "1.1", "1.2") of the sub-topics that were *actually* tested or relevant in this specific question.
    - "questionText": The setup/scenario description ONLY. Do NOT include the sub-questions (a, b, c) here. If a table of data is needed, include it here using Markdown.
    - "parts": An array of objects for the sub-questions. For Short Answer, generate 2-3 parts. For Long Answer, generate 4-5 parts.
      - "label": "Part (a)", "Part (b)", etc.
      - "text": The specific instruction (e.g. "Draw the Lewis structure for...", "Calculate the pH of...", "Explain why...").
      - "points": Integer value. The sum of all points MUST equal ${totalPoints}.
    - "scoringGuide": The detailed rubric explaining how points are awarded for each part. Follow the formatting rules above strictly to ensure readability.
    - "imagePrompts": An array of strings. Describe 1-2 essential diagrams or graphs needed for the question setup. Be extremely descriptive for an AI image generator. Examples:
      • Particulate diagrams: "A beaker containing a solution with dissociated ions shown as circles: 5 red circles labeled 'Na+' and 5 green circles labeled 'Cl-' distributed randomly in water, simple schematic style, black and white"
      • PES spectra: "Photoelectron spectrum showing peaks at different binding energies, x-axis labeled 'Binding Energy (MJ/mol)', y-axis labeled 'Relative Number of Electrons', with peaks corresponding to electron shells"
      • Lab setups: "Titration setup showing burette above an Erlenmeyer flask with magnetic stir bar, simple line drawing, labeled components"
    - "scoringGuideImagePrompts": An array of strings for visual aids in the scoring guide. Include when needed for:
      • Lewis structures (e.g., "Lewis structure of SO3 showing sulfur atom bonded to three oxygen atoms with double bonds, all atoms labeled, formal charges shown")
      • Reaction coordinate diagrams (e.g., "Energy diagram showing reactants, transition state peak, and products, with activation energy Ea and enthalpy change ΔH labeled")
      • Particulate diagrams showing before/after reaction (e.g., "Two beakers side by side: left shows 'before' with intact molecules, right shows 'after' with dissociated ions")
      • Titration curves (e.g., "pH vs volume of titrant curve showing equivalence point at pH 7, with half-equivalence point labeled")
      Use the same detailed, technical style as question image prompts.

    Ensure the scenario in "questionText" provides all necessary data and context that are referenced in the "parts".
    Ensure "scoringGuide" perfectly aligns with the generated "parts".

    Format the output as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usedSubTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of sub-topic IDs that were actually used in the generated question (e.g., ['2.1', '2.2'])."
            },
            questionText: { type: Type.STRING, description: "The intro text and scenario description ONLY. Do NOT include parts a, b, c here." },
            parts: {
              type: Type.ARRAY,
              description: "The individual question parts (a, b, c, etc.) that the student must answer. MUST NOT BE EMPTY.",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "e.g., 'Part (a)'" },
                  text: { type: Type.STRING, description: "The specific question/task text for this part." },
                  points: { type: Type.NUMBER, description: "Point value for this part." }
                },
                required: ["label", "text", "points"]
              }
            },
            imagePrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Prompts to generate diagrams/graphs needed for the question setup."
            },
            scoringGuide: { type: Type.STRING, description: "Full text of the scoring guide/rubric." },
            scoringGuideImagePrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Prompts to generate visual aids for the scoring guide (graphs, extended tables, FBDs). Only include when needed to show calculations, linearized data, or correct diagrams."
            }
          },
          required: ["questionText", "parts", "scoringGuide"]
        }
      }
    });

    let textResponse = response.text || "{}";
    if (textResponse.includes("```json")) {
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "");
    }

    const data = JSON.parse(textResponse);
    
    // Ensure parts array exists
    if (!data.parts || !Array.isArray(data.parts)) {
        console.warn("Model failed to generate parts array correctly. Attempting to recover...");
        data.parts = []; 
    }
    
    // Generate images based on prompts for question
    const images: string[] = [];
    if (data.imagePrompts && Array.isArray(data.imagePrompts) && data.imagePrompts.length > 0) {
        for (const imgPrompt of data.imagePrompts) {
            try {
                // Enforce a schematic style for better chemistry diagrams
                const stylePrompt = `Technical textbook diagram, schematic line art, black and white, high contrast, white background, no shading, vector style. Clearly labeled. Subject: ${imgPrompt}`;

                const imgResponse = await ai.models.generateContent({
                    model: IMAGE_GEN_MODEL,
                    contents: stylePrompt,
                    config: {
                        imageConfig: {
                            imageSize: "1K",
                            aspectRatio: "16:9" // Landscape usually fits scenarios better
                        }
                    }
                });

                if (imgResponse.candidates && imgResponse.candidates[0].content.parts) {
                    for (const part of imgResponse.candidates[0].content.parts) {
                        if (part.inlineData) {
                            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                            break;
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to generate question image for prompt (continuing without image):", imgPrompt);
            }
        }
    }

    // Generate images for scoring guide (graphs, tables, FBDs)
    const scoringGuideImages: string[] = [];
    if (data.scoringGuideImagePrompts && Array.isArray(data.scoringGuideImagePrompts) && data.scoringGuideImagePrompts.length > 0) {
        for (const imgPrompt of data.scoringGuideImagePrompts) {
            try {
                // Use same technical style for consistency
                const stylePrompt = `Technical textbook diagram, schematic line art, black and white, high contrast, white background, no shading, vector style. Clearly labeled with all values and units shown. Subject: ${imgPrompt}`;

                const imgResponse = await ai.models.generateContent({
                    model: IMAGE_GEN_MODEL,
                    contents: stylePrompt,
                    config: {
                        imageConfig: {
                            imageSize: "1K",
                            aspectRatio: "16:9"
                        }
                    }
                });

                if (imgResponse.candidates && imgResponse.candidates[0].content.parts) {
                    for (const part of imgResponse.candidates[0].content.parts) {
                        if (part.inlineData) {
                            scoringGuideImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                            break;
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to generate scoring guide image for prompt (continuing without image):", imgPrompt);
            }
        }
    }

    return {
      questionText: data.questionText || "Error retrieving question text.",
      parts: data.parts,
      images: images,
      scoringGuide: data.scoringGuide || "Scoring guide unavailable.",
      scoringGuideImages: scoringGuideImages,
      maxPoints: data.parts.reduce((acc: number, p: any) => acc + (p.points || 0), 0),
      metadata: {
        frqType: type,
        frqTypeShort: getFRQTypeShort(type),
        unit: unit,
        selectedSubTopics: selectedSubTopics,
        actualSubTopics: data.usedSubTopics || []
      }
    };

  } catch (error) {
    console.error("Error generating FRQ:", error);
    throw new Error("Failed to generate FRQ. Please try again.");
  }
};

export const gradeSubmission = async (
  frq: GeneratedFRQ,
  submissionBase64: string,
  mimeType: string
): Promise<AssessmentResult> => {
  
  const userContentPart = {
      inlineData: {
          mimeType: mimeType, 
          data: submissionBase64
      }
  };

  const prompt = `
    You are an AP Chemistry Reader (Grader).
    
    Here is the Question and Scoring Guide:
    ${JSON.stringify(frq)}

    Here is the Student's Submission (see attached).

    Task:
    1. Score the submission strictly according to the provided scoring guide.
    2. Provide specific feedback for each part, explaining why points were earned or lost.
    3. Calculate the total score.
    4. Format your feedback using Markdown and LaTeX for math ($...$). 
    
    IMPORTANT: Ensure the feedback uses standard Markdown formatting (bold, bullet points) and proper LaTeX delimiters for math.

    Format output as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
        model: VISION_MODEL_NAME,
        contents: {
            parts: [
                { text: prompt },
                userContentPart
            ]
        },
        config: {
            thinkingConfig: { thinkingBudget: 1024 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                    breakdown: { type: Type.STRING }
                }
            }
        }
    });

    return JSON.parse(response.text!);
  } catch (error) {
      console.error("Error grading submission:", error);
      throw new Error("Failed to grade submission.");
  }
};

export const chatWithTutor = async (
    history: { role: string, text: string }[],
    newMessage: string,
    context: any
): Promise<string> => {
    const prompt = `
      Context: The user is discussing an AP Chemistry FRQ.
      Question Data: ${JSON.stringify(context.frq)}
      Grading Result (if any): ${JSON.stringify(context.result)}

      You are a helpful chemistry tutor. Answer the student's questions about the problem, the chemistry concepts, or their grading.
      Be encouraging but rigorous. Use Markdown for clarity and LaTeX ($...$) for math and chemical equations.
    `;

    const contents = [
        { role: 'user', parts: [{ text: prompt }] },
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: newMessage }] }
    ];

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
            config: {
                thinkingConfig: { thinkingBudget: 1024 },
            }
        });
        return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Chat error", error);
        return "Error connecting to tutor.";
    }
};
