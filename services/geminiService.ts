
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

// ---------- Topic helpers ----------

const ALL_SUBTOPICS: { id: string; name: string; unitId: Unit; unitName: string }[] =
  UNITS.flatMap(u => u.subTopics.map(s => ({ id: s.id, name: s.name, unitId: u.id, unitName: u.name })));

const pickRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Pick 3-5 random topics across the whole AP Chemistry pool.
 * Used when the user clicks Generate without selecting anything.
 */
export const pickRandomSubTopicSelection = (): string[] => {
  const count = pickRandomInt(3, 5);
  const shuffled = [...ALL_SUBTOPICS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(s => s.id);
};

/**
 * Given the user's (possibly empty) selections, resolve the permissible topic pool.
 * - If nothing was selected: returns a random 3-5 topic pool with wasRandom=true.
 * - If units-only were selected: expands to all sub-topics in those units.
 * - Otherwise passes through the explicit sub-topic selection.
 */
const resolveTopicPool = (
  selectedUnits: Unit[],
  selectedSubTopics: string[]
): { subTopicIds: string[]; wasRandom: boolean } => {
  if (selectedUnits.length === 0 && selectedSubTopics.length === 0) {
    return { subTopicIds: pickRandomSubTopicSelection(), wasRandom: true };
  }
  if (selectedSubTopics.length === 0 && selectedUnits.length > 0) {
    const ids = ALL_SUBTOPICS.filter(s => selectedUnits.includes(s.unitId)).map(s => s.id);
    return { subTopicIds: ids, wasRandom: false };
  }
  return { subTopicIds: selectedSubTopics, wasRandom: false };
};

/**
 * Build a human-readable topic context block for the prompt, grouped by unit.
 */
const formatTopicContext = (subTopicIds: string[]): string => {
  const byUnit = new Map<Unit, { unitName: string; topics: { id: string; name: string }[] }>();
  for (const id of subTopicIds) {
    const meta = ALL_SUBTOPICS.find(s => s.id === id);
    if (!meta) continue;
    if (!byUnit.has(meta.unitId)) {
      byUnit.set(meta.unitId, { unitName: meta.unitName, topics: [] });
    }
    byUnit.get(meta.unitId)!.topics.push({ id: meta.id, name: meta.name });
  }
  const lines: string[] = [];
  for (const [, { unitName, topics }] of byUnit) {
    lines.push(`- ${unitName}`);
    for (const t of topics) {
      lines.push(`    - ${t.id} ${t.name}`);
    }
  }
  return lines.join('\n');
};

export const generateFRQ = async (
  type: FRQType,
  selectedUnits: Unit[],
  selectedSubTopics: string[]
): Promise<GeneratedFRQ> => {

  const { subTopicIds, wasRandom } = resolveTopicPool(selectedUnits, selectedSubTopics);
  const topicContext = formatTopicContext(subTopicIds);

  const totalPoints = FRQ_POINT_TOTALS[type];

  const prompt = `
    You are an experienced College Board AP Chemistry exam writer and rubric designer.
    Your task is to produce one authentic, exam-quality Free Response Question in the
    STRICT format used on the AP Chemistry exam (current CED).

    === CONTENT SCOPE ===
    Permissible topic pool (draw ONLY from these):
${topicContext}

    Rules for content scope:
    - Every chemistry concept tested in the question or named in the rubric MUST come
      from this pool.
    - If the pool spans more than one unit, favor a question that naturally integrates
      concepts across at least two of the listed topics (the current CED explicitly
      rewards cross-unit integration: e.g. stoichiometry + thermodynamics, or
      equilibrium + acid-base).
    - Do not drift into adjacent topics that are not in the pool.
    - Return "usedSubTopics" as an array of the topic IDs (e.g. ["3.2","6.4"]) that the
      question and rubric actually draw upon.

    === COURSE CONTEXT (CED) ===
    AP Chemistry covers 9 units: (1) Atomic Structure and Properties, (2) Molecular
    and Ionic Compound Structure and Properties, (3) Intermolecular Forces and
    Properties, (4) Chemical Reactions, (5) Kinetics, (6) Thermodynamics, (7)
    Equilibrium, (8) Acids and Bases, (9) Applications of Thermodynamics. The exam
    features two FRQ types: Long Answer (10 points, multipart, integrating several
    units) and Short Answer (4 points, focused on a single phenomenon or skill). The
    course emphasizes six Science Practices — especially model use (Lewis structures,
    particulate diagrams, PES spectra, reaction-coordinate diagrams, titration
    curves), mathematical routines, and experimental design/analysis. Students are
    expected to write claims supported by evidence and reasoning in words as well as
    mathematical or symbolic form.

    === FRQ TYPE: "${type}" ===
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
        selectedUnits,
        selectedSubTopics,
        actualSubTopics: Array.isArray(data.usedSubTopics) ? data.usedSubTopics : [],
        wasRandom
      }
    };

  } catch (error) {
    console.error("Error generating FRQ:", error);
    throw new Error("Failed to generate FRQ. Please try again.");
  }
};

// ---------- Grading ----------

export const STUDENT_RESPONSE_EXTRACTION_RULES = `
=== STUDENT RESPONSE EXTRACTION RULES (READ BEFORE GRADING) ===

You are looking at a scanned or photographed handwritten student response to an AP
Chemistry FRQ. Before you grade anything, you must first EXTRACT what the student
actually wrote. Follow these rules exactly.

1. CRITICAL: EXACT EXTRACTION ONLY.
   Extract exactly what the student wrote. NEVER summarise, paraphrase, interpret, or
   substitute your own understanding of what the student meant. The marker must see the
   student's actual words and working, not a cleaned-up or interpreted version. The
   difference between what a student wrote and what they meant to write can be the
   difference between awarding and withholding marks. Permitted minor corrections:
   normalising clearly sloppy letterforms (e.g. a sloppy "H" clearly meant as "H" in a
   bond-line structure), standard sub/superscript formatting (H2O → H₂O, Na+ → Na⁺),
   standard math symbols (triangle symbol → ∆). NEVER replace an incorrect chemical
   formula with the correct one, balance an unbalanced equation the student left
   unbalanced, fill in skipped steps, rephrase a verbal answer, silently correct wrong
   element symbols or charges, or add any words the student did not write.

2. IGNORE THE OCR LAYER.
   Scanned PDFs often carry a machine OCR text layer — it is generally poor quality and
   (for chemistry especially, with subscripts and charges) often wrong. Disregard it
   entirely and read the page visually.

3. SURVEY EACH PAGE HOLISTICALLY BEFORE EXTRACTING.
   Look for arrows indicating continuation order, bracket/brace markers grouping
   content, crossing-out or deletion marks, margin annotations vs. main answer, and
   flag symbols or letters marking where a new question begins.

4. SCAN THE ENTIRE PDF FOR EACH QUESTION BEFORE FINALISING.
   Students routinely continue a response on a later page, in a margin, on the blank
   back of a previous page, or on additional loose paper. Check every page of the PDF
   for labelled continuations ("Q2(c) continued", "see page 4"), for arrows pointing
   off the edge of a page, for work written on a page designated for a different
   question but labelled for this one, and for unlabelled work on blank/gap pages that
   logically continues a previous response.

5. FOLLOW STUDENT-INDICATED READING ORDER.
   Arrows, circles, numbered flags, and "(continued here)" markers indicate non-linear
   reading order. When in doubt, use the order that makes the chemical reasoning
   logically coherent.

6. CROSSED-OUT WORK IS NOT PART OF THE ANSWER.
   - Single line through: minor correction, discard the struck-out portion.
   - Large diagonal cross (X) or scribble over a block: fully retracted — do NOT grade
     that content, even if it looks correct.
   - Two uncrossed competing attempts: grade the LAST attempt.
   Note crossed-out sections briefly (e.g. "[crossed-out working omitted]") so the
   marker knows they exist, but do not include their content.

7. NEVER FILL GAPS.
   If the student wrote nothing for a part, record "[no response]" and award 0 points.
   Do not grade what they might have meant.

8. CHEMICAL FORMULAS AND EQUATIONS.
   - Preserve the exact symbols the student wrote. Distinguish carefully between
     uppercase and lowercase (Co = cobalt vs CO = carbon monoxide; Mg vs mg; Hg vs hg).
   - Preserve subscripts and superscripts faithfully (H₂O, CO₃²⁻, NH₄⁺). If the
     student wrote H2O with no subscript, note that the "2" was not subscripted.
   - Preserve state symbols exactly as written ((s), (l), (g), (aq)). Note missing
     state symbols — they are often required by the rubric.
   - Preserve the exact coefficient the student wrote in a balanced equation. DO NOT
     silently re-balance an unbalanced equation for them.
   - Distinguish the student's use of → vs ⇌ (reaction arrows). Equilibrium vs
     one-way arrow selection is frequently scored.
   - For ionic charges, reproduce exactly what is written (Fe²⁺ vs Fe⁺² vs Fe+2 —
     preserve the student's ordering and positioning).

9. LEWIS STRUCTURES AND PARTICULATE DIAGRAMS.
   Lewis structures and particulate-level diagrams carry significant scoring weight.
   For each Lewis structure:
   - Identify the central atom and peripheral atoms.
   - Count the total number of bonds drawn between each pair of atoms (single, double,
     triple). State exactly what the student drew, not what the correct structure would
     be.
   - Count the lone pairs shown on each atom. Note missing lone pairs on atoms that
     require them.
   - Note any formal charges or partial charges (δ+, δ−) the student labelled.
   - If the student drew multiple resonance structures, extract each one separately.
   For particulate diagrams (e.g. before/after of a reaction, solutions with
   dissociated ions):
   - Count the number of each type of particle by label.
   - Note whether ions are shown separated (dissociated) or still bonded.
   - Describe the spatial distribution if it is relevant to the question (clustered,
     evenly distributed, etc.).
   - Note extraneous particles or missing particles relative to what the question setup
     implies.

10. DATA TABLES AND CALCULATIONS.
    If the student produced a numerical table (common in lab-analysis problems),
    extract it as a Markdown table preserving their exact column headers (including
    units) and all numerical values. Note blank or illegible cells. For calculations,
    preserve every intermediate line of working — do not collapse steps. Note the
    units the student wrote at each step and whether unit tracking is consistent.

11. GRAPHS (titration curves, reaction progress, kinetics plots).
    Describe: axis labels and units (reproduce verbatim); pre-printed vs student-added
    scale values; starting and ending coordinates of the curve; key features (plateaus,
    inflection points, equivalence points the student labelled); whether the curve
    shape is concave up/down/sigmoidal/linear; any annotations (half-equivalence,
    pKa, activation energy Ea, ∆H); and the exact position of labelled points.

12. SELECTION-AND-JUSTIFY AND CLAIM–EVIDENCE–REASONING.
    Many AP Chem parts ask the student to choose (e.g. "which substance has the
    higher boiling point") and justify with a specific intermolecular force, bond
    energy, or trend. Extract the selection FIRST (e.g. "Selected: NH₃"), then
    extract the justification separately and verbatim. Scoring often separates the
    claim from the reasoning — do not merge them.

13. MULTI-PAGE CONTINUATIONS.
    If Part (c) begins on page 2 and continues on page 4 via an arrow, the full
    response for Part (c) is the concatenation of both regions in the order indicated.

14. PART LABELING.
    Identify which student writing corresponds to which part using the student's own
    labels where present, and spatial cues (paragraph breaks, blank lines) otherwise.
    Do not merge parts.

15. CHEMISTRY SYMBOL DISAMBIGUATION (use for reading, never to "correct" the student).
    - Element ambiguity: Co vs CO, Cu vs CU, Mg vs Mg etc. — preserve case exactly.
    - K can mean potassium (element), equilibrium constant, or Kelvin — use context.
    - Uppercase M (molarity, molar mass) vs lowercase m (mass, molality).
    - ΔH vs ∆H (same thing, both acceptable) — preserve what the student wrote.
    - Degree symbol in temperatures (25°C vs 25 C) — preserve.

Record the per-part extraction in the "extractedResponse" field as plain text with one
labeled block per part, e.g.:

  Part (a): <verbatim text>
  Part (b): <verbatim text>
  ...

=== END EXTRACTION RULES ===
`;

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

  // Pass a curated FRQ payload (no metadata bloat)
  const frqPayload = JSON.stringify({
    frqType: frq.metadata.frqTypeShort,
    questionText: frq.questionText,
    parts: frq.parts,
    scoringGuide: frq.scoringGuide,
    maxPoints: frq.maxPoints
  }, null, 2);

  const prompt = `
You are an AP Chemistry Reader (Grader).

${STUDENT_RESPONSE_EXTRACTION_RULES}

=== QUESTION + RUBRIC ===
${frqPayload}

=== TASK ===
STEP 1: Apply the extraction rules above to the attached student submission. Produce
        a clean per-part extraction of what the student actually wrote — verbatim,
        preserving chemical formulas, state symbols, arrow types, charges, and
        diagrams as specified — before grading.
STEP 2: Grade each part strictly per the scoring guide. Award points only for what
        the student actually wrote (not what you think they meant). Quote the
        student's extracted writing when explaining a point decision.
STEP 3: Provide a concise feedback paragraph per part explaining why points were
        earned or lost, referencing the rubric language.
STEP 4: Compute the total score out of ${frq.maxPoints}. Never exceed ${frq.maxPoints}.
STEP 5: Use Markdown formatting (bold, bullet points) and LaTeX for math and chemical
        formulas wrapped in single dollar signs (e.g. $K_a = \\frac{[H^+][A^-]}{[HA]}$,
        $\\text{H}_2\\text{O}(l)$).

Output JSON with:
  score: number (0-${frq.maxPoints})
  maxScore: ${frq.maxPoints}
  feedback: markdown string with per-part headings
  breakdown: compact table: Part | Points awarded | Max | Reason
  extractedResponse: plain text per-part extraction
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
            thinkingConfig: { thinkingBudget: 2048 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                    breakdown: { type: Type.STRING },
                    extractedResponse: { type: Type.STRING }
                },
                required: ["score", "maxScore", "feedback", "breakdown", "extractedResponse"]
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
