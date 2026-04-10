---
name: handwritten-exam-reader
description: Read, interpret, and extract handwritten student responses from scanned PDFs. Use this skill whenever you are given a scanned PDF containing handwritten chemistry (or other subject) exam answers and asked to extract. This skill is essential for any workflow involving student exam submissions, handwritten assessments, grading pipelines, or mark-scheme comparison tasks. Trigger whenever the user uploads a scanned PDF with handwritten content and wants it read, transcribed, or assessed.
---

# Handwritten Exam Reader

This skill defines how to visually read and faithfully extract handwritten student responses from scanned PDFs, with particular reference to AP Chemistry. The principles generalise to any handwritten science or mathematics exam.

---

## CRITICAL REQUIREMENT: Exact Extraction Only

**You must extract exactly what the student wrote. Never summarise, paraphrase, interpret, or substitute your own understanding of what the student meant.**

This is an assessment context. The marker must see the student's actual words and working, not a cleaned-up or interpreted version. The distinction between what a student wrote and what they meant to write can be the difference between awarding and withholding marks.

**Permitted corrections (minor only):**
- Normalising clearly sloppy letterforms (e.g., a sloppy "H" that is unambiguously meant to be an "H" in a bond-line structure)
- Standardising superscript/subscript formatting for readability (e.g., rendering H2O as H₂O, or Na+ as Na⁺)
- Inserting standard mathematical symbols where the student has used a common shorthand (e.g., rendering "∆" when the student wrote a triangle symbol)

**Never permitted:**
- Replacing an incorrect chemical formula with the correct one
- Balancing an unbalanced equation that the student left unbalanced
- Filling in steps the student skipped
- Rephrasing a verbal answer to be more precise or complete
- Silently correcting wrong element symbols, charges, or notation
- Adding words, qualifiers, or explanations not present in the student's writing

**Never Fill Gaps:** If the student wrote nothing for a part, record "[no response]" and award 0 points. Do not grade what they might have meant.

---

## Core Philosophy

**Ignore the OCR layer.** Scanned PDFs often contain a machine-generated OCR text layer from the scanner. This layer is generally poor quality and—for chemistry especially, with subscripts and charges—is often wrong. Disregard it entirely and read the page visually.

**Read visually, not linearly.** Handwritten exam answers do not always flow top-to-bottom on the page. Students run out of space, add continuations, draw arrows, and cross things out. Always survey the full page before extracting content.

---

## Page-Level Interpretation Rules

### 1. Survey each page holistically before extracting
Before extracting any answer, scan the entire page for:
- Arrows indicating continuation order
- Bracket/brace markers grouping content
- Crossing-out or deletion marks
- Margin annotations vs. main answer content
- Flag symbols or letters marking where a new question begins

### 2. Scan the entire PDF for each question before finalising
Students routinely continue a response on a later page, in a margin, on the blank back of a previous page, or on additional loose paper appended after the booklet. Before finalising the extraction for any question, check every page of the PDF for:
- Written labels like "Q2(c) continued" or "see page 4"
- Arrows pointing off the edge of a page toward another location
- Work written on a page designated for a different question but labelled for the current one
- Unlabelled work on blank or gap pages that logically continues a previous response

*Note: If Part (c) begins on page 2 and continues on page 4 via an arrow, the full response for Part (c) is the concatenation of both regions in the order indicated.*

### 3. Follow student-indicated reading order
Students use several devices to indicate non-linear reading order:
- **Arrows or circles with arrows pointing away from text**: An arrow from below text, or from circled text leading to another set of text, usually indicates "start with the first set of text, then continue with the next set of text." 
- **Numbered flags**: A circled or flagged symbol marks where a new question begins mid-page.
- **Continuation markers**: Phrases like "(continued here)" or arrows pointing off-page signal overflow content.

When in doubt, use the order that makes the chemical reasoning logically coherent.

### 4. Part Labeling
Identify which student writing corresponds to which part using the student's own labels where present, and spatial cues (paragraph breaks, blank lines) otherwise. Do not merge parts.

---

## Handling Crossed-Out Work

**Crossed-out work is not part of the student's answer and must not be marked.**

Types of deletion to recognise:
- **Single line through**: Minor correction, usually within a working step. Discard the struck-out portion.
- **Large diagonal cross (X) or scribble over a block**: Student explicitly retracts the entire section. Do NOT extract or grade this content, even if it looks physically or chemically correct.
- **Two uncrossed competing attempts**: If a student provides two distinct attempts and crosses neither out, grade the LAST attempt.

When extracting, note crossed-out sections briefly (e.g., *"[crossed-out working omitted]"*) so the marker is aware they exist, but do not include their content in the assessed answer.

---

## Chemical Content Extraction

### Chemical Formulas and Equations
- **Symbols and Case:** Preserve the exact symbols the student wrote. Distinguish carefully between uppercase and lowercase (e.g., Co = cobalt vs CO = carbon monoxide; Mg vs mg; Hg vs hg).
- **Subscripts and Superscripts:** Preserve them faithfully (e.g., H₂O, CO₃²⁻, NH₄⁺). If the student wrote H2O with no subscript, note explicitly that the "2" was not subscripted.
- **State Symbols:** Preserve state symbols exactly as written ((s), (l), (g), (aq)). Note missing state symbols, as they are often required by the rubric.
- **Coefficients:** Preserve the exact coefficient the student wrote in a balanced equation. DO NOT silently re-balance an unbalanced equation.
- **Reaction Arrows:** Distinguish the student's use of → vs ⇌. Equilibrium vs. one-way arrow selection is frequently scored.
- **Ionic Charges:** Reproduce exactly what is written. For example, Fe²⁺ vs Fe⁺² vs Fe+2 — preserve the student's exact ordering and positioning.

### Data Tables and Calculations
- **Data Tables:** If the student produced a numerical table (common in lab-analysis problems), extract it as a Markdown table preserving their exact column headers (including units) and all numerical values. Note any blank or illegible cells.
- **Calculations:** Preserve every intermediate line of working — do not collapse steps. Note the units the student wrote at each step and whether unit tracking is consistent.

---

## Diagram and Graph Extraction

Lewis structures, particulate diagrams, and graphs carry significant scoring weight in AP Chemistry. Err on the side of over-describing rather than under-describing.

### Lewis Structures
For each Lewis structure:
- Identify the central atom and peripheral atoms.
- Count the total number of bonds drawn between each pair of atoms (single, double, triple). State exactly what the student drew, not what the correct structure would be.
- Count the lone pairs shown on each atom. Note missing lone pairs on atoms that require them.
- Note any formal charges or partial charges (δ+, δ−) the student labelled.
- If the student drew multiple resonance structures, extract each one separately.

### Particulate Diagrams
For particulate diagrams (e.g., before/after of a reaction, solutions with dissociated ions):
- Count the number of each type of particle by label.
- Note whether ions are shown separated (dissociated) or still bonded together.
- Describe the spatial distribution if it is relevant to the question (e.g., clustered at the bottom, evenly distributed).
- Note extraneous particles or missing particles relative to what the question setup implies.

### Graphs (Titration Curves, Reaction Progress, Kinetics Plots)
Describe the following:
- **Axis labels and units**: Reproduce them verbatim.
- **Scales**: Detail pre-printed vs. student-added scale values.
- **Coordinates**: The starting and ending coordinates of the curve.
- **Key Features**: Note any plateaus, inflection points, or equivalence points the student labelled.
- **Curve Shape**: Is the curve concave up, concave down, sigmoidal, or linear?
- **Annotations**: Describe any specific markings like half-equivalence points, pKa, activation energy (Ea), or enthalpy change (∆H).
- **Labelled Points**: The exact position of any student-labelled points on the grid.

---

## Selection-and-Justify and CER (Claim-Evidence-Reasoning)

Many AP Chem questions ask the student to choose an option (e.g., "which substance has the higher boiling point") and justify it with a specific intermolecular force, bond energy, or trend. 

- **Extract the selection FIRST.** State clearly which option was selected (e.g., "Selected: NH₃").
- **Then extract the justification** separately and verbatim. 

Scoring rubrics almost always separate the claim from the reasoning — do not merge them into a single paraphrase.

---

## Common Student Handwriting Challenges

| Challenge | How to handle |
|---|---|
| Very light pencil | Increase contrast mentally; look for indentations in the scan |
| Mixed print and cursive in same answer | Read holistically, not letter-by-letter |
| Subscripts vs. Coefficients | Pay attention to relative size and position (e.g., 2H vs H₂) |
| Overwritten corrections | Read the top layer; note the original if visible |
| Case Sensitivity | Carefully distinguish between uppercase and lowercase letters (Co vs CO) |

---

## Chemistry Symbol Disambiguation

Knowing the subject matter aids interpretation. Use this to disambiguate handwritten symbols — but **never** use this knowledge to "correct" what the student actually wrote.

- **Element ambiguity:** Co vs CO, Cu vs CU, Mg vs Mg, etc. Preserve the case exactly as written.
- **The letter K:** Can refer to potassium (the element), an equilibrium constant (K_eq, K_a, K_p), or Kelvin (temperature). Use context to read it properly.
- **M vs m:** Uppercase M usually refers to molarity or molar mass. Lowercase m refers to mass or molality.
- **Delta H:** ΔH vs ∆H (same thing, both acceptable) — preserve whichever triangle style the student drew.
- **Temperatures:** Preserve exactly how the student wrote the degree symbol (e.g., 25°C vs 25 C).

---

## Chemistry-Specific Context (AP Chemistry, All Units)

Knowing the subject matter aids interpretation. The full course covers nine units. Common symbols, equations, and concepts by unit are listed below. Use this to disambiguate handwritten symbols — but never use this knowledge to correct or improve what the student actually wrote.

**General symbol conventions (apply across all units):**
- **States of matter**: (s) solid, (l) liquid, (g) gas, (aq) aqueous.
- **Variables**: T = temperature, P = pressure, V = volume, n = moles, m = mass, M (or MW/MM) = molar mass, t = time, q = heat, c (or s) = specific heat capacity.
- **Constants**: R = ideal gas constant, k = rate constant, K = equilibrium constant, Kw = ion-product constant for water, Ka = acid dissociation constant, Kb = base dissociation constant, Ksp = solubility product constant.
- **Greek letters**: Δ (delta) = change in, λ (lambda) = wavelength, ν (nu) = frequency, ε (epsilon) = molar absorptivity.

---

### Unit 1 — Atomic Structure and Properties
Moles, molar mass, mass spectrometry, elemental composition, empirical/molecular formulas, electron configuration, photoelectron spectroscopy (PES), and periodic trends.

**Key expressions:** n = m/M, Fcoulombic ∝ (q₁q₂)/r²
**Watch for:** - Distinguishing between mass number, atomic number, and average atomic mass.
- PES graph axis labels (Binding Energy is often plotted backwards, decreasing left to right).
- Electron configuration notation (e.g., 1s² 2s² 2p⁶).

---

### Unit 2 — Compound Structure and Properties
Chemical bonds (ionic, polar covalent, nonpolar covalent), metallic bonding, alloys (interstitial vs. substitutional), Lewis diagrams, resonance, formal charge, and VSEPR theory.

**Watch for:**
- Exact placement of lone pairs (dots) and bonds (lines) in Lewis structures.
- Formal charge annotations directly on atoms (e.g., a circled + or -).
- Hybridization notation (sp, sp², sp³).
- Distinguishing between sigma (σ) and pi (π) bonds in student explanations.

---

### Unit 3 — Properties of Substances and Mixtures
Intermolecular forces (LDFs, dipole-dipole, hydrogen bonding, ion-dipole), properties of solids/liquids/gases, kinetic molecular theory, ideal gas law, solutions, solubility, and the Beer-Lambert law.

**Key expressions:** PV = nRT, P_A = P_total × X_A, KE = ½mv², M = n_solute / L_solution, c = λν, E = hν, A = εbc
**Watch for:**
- "LDF" used as shorthand for London Dispersion Forces.
- Clear distinction between *inter*molecular forces (between molecules) and *intra*molecular bonds (within molecules).
- Macroscopic vs. particulate representations of mixtures and solutions (paying attention to ion orientation around water molecules).

---

### Unit 4 — Chemical Reactions
Physical vs. chemical changes, net ionic equations, stoichiometry, limiting reactants, titrations, and types of reactions (acid-base, redox, precipitation).

**Watch for:**
- Oxidation numbers vs. ionic charges (e.g., +2 vs 2+). Preserve exactly what the student wrote.
- Spectator ions crossed out in the steps leading to a net ionic equation.
- Titration curves: identifying axes (usually pH vs. volume of titrant).

---

### Unit 5 — Kinetics
Reaction rates, rate laws, concentration vs. time, elementary reactions, collision model, reaction energy profiles, mechanisms, and catalysis.

**Key expressions:** - Zeroth order: [A]_t - [A]₀ = -kt
- First order: ln[A]_t - ln[A]₀ = -kt
- Second order: 1/[A]_t - 1/[A]₀ = kt
- Half-life: t_1/2 = 0.693/k
**Watch for:**
- Capital K (equilibrium) vs. lowercase k (rate constant). Ensure capitalization is captured accurately.
- Order of reaction exponents in rate laws: Rate = k[A]^m[B]^n.
- Energy profile diagrams: marking of Activation Energy (Ea) and enthalpy change (ΔH).

---

### Unit 6 — Thermochemistry
Endothermic and exothermic processes, heat transfer, heat capacity, calorimetry, enthalpy of reaction, bond enthalpies, enthalpy of formation, and Hess's Law.

**Key expressions:** q = mcΔT, ΔH°_rxn = ΣΔH°_f(products) - ΣΔH°_f(reactants)
**Watch for:**
- Signs on enthalpy values (+ΔH vs -ΔH). The sign is critical for scoring.
- Ensure units are extracted accurately (J vs kJ).
- Distinguishing between specific heat capacity (c) and molar heat capacity.

---

### Unit 7 — Equilibrium
Reversible reactions, reaction quotient (Q), equilibrium constant (K), Le Châtelier's principle, and solubility equilibria (Ksp).

**Key expressions:** Kc = [C]^c[D]^d / [A]^a[B]^b, Kp = (P_C)^c(P_D)^d / (P_A)^a(P_B)^b
**Watch for:**
- The use of brackets [ ] for concentration vs. parentheses ( ) for partial pressure. This distinction is strictly graded in AP Chem.
- ICE (Initial, Change, Equilibrium) tables. Extract the entire table structure, noting any variables like "+x" or "-2x".
- "Q vs K" justification statements.

---

### Unit 8 — Acids and Bases
pH and pOH, strong vs. weak acids/bases, acid-base buffer systems, buffer capacity, titrations (half-equivalence point), and the Henderson-Hasselbalch equation.

**Key expressions:** - pH = -log[H₃O⁺], pOH = -log[OH⁻]
- Kw = [H₃O⁺][OH⁻] = 1.0 × 10⁻¹⁴
- pKw = 14 = pH + pOH
- pH = pKa + log([A⁻]/[HA])
**Watch for:**
- H⁺ and H₃O⁺ are used interchangeably; extract exactly what the student wrote.
- Annotations on titration curves identifying the equivalence point or the buffering region (half-equivalence point where pH = pKa).

---

### Unit 9 — Thermodynamics and Electrochemistry
Entropy (ΔS), Gibbs free energy (ΔG), thermodynamic favorability, coupled reactions, galvanic/voltaic vs. electrolytic cells, standard cell potential (E°), nonstandard conditions, and Faraday's Law.

**Key expressions:**
- ΔS°_rxn = ΣS°(products) - ΣS°(reactants)
- ΔG°_rxn = ΣΔG°_f(products) - ΣΔG°_f(reactants)
- ΔG° = ΔH° - TΔS°
- ΔG° = -RT ln K
- ΔG° = -nFE°
- I = q/t
**Watch for:**
- Anode/Cathode labels on cell diagrams.
- Arrow directions showing electron flow through the wire or ion flow through the salt bridge.
- Unit mismatches (e.g., ΔH given in kJ but ΔS given in J/K) in student working.

---

## Output Formatting

Record the per-part extraction in the `extractedResponse` field as plain text with one labeled block per part. For example:

Part (a): [verbatim text]
Part (b): [verbatim text]
...