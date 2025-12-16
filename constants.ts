import { Unit, UnitData, FRQType } from './types';

export const FRQ_POINT_TOTALS: Record<FRQType, number> = {
  [FRQType.Short]: 4,
  [FRQType.Long]: 10
};

export const UNITS: UnitData[] = [
  {
    id: Unit.Atomic,
    name: "Unit 1: Atomic Structure and Properties",
    subTopics: [
      { id: "1.1", name: "Moles and Molar Mass" },
      { id: "1.2", name: "Mass Spectra of Elements" },
      { id: "1.3", name: "Elemental Composition of Pure Substances" },
      { id: "1.4", name: "Composition of Mixtures" },
      { id: "1.5", name: "Atomic Structure and Electron Configuration" },
      { id: "1.6", name: "Photoelectron Spectroscopy" },
      { id: "1.7", name: "Periodic Trends" },
      { id: "1.8", name: "Valence Electrons and Ionic Compounds" }
    ]
  },
  {
    id: Unit.Molecular,
    name: "Unit 2: Molecular and Ionic Compound Structure and Properties",
    subTopics: [
      { id: "2.1", name: "Types of Chemical Bonds" },
      { id: "2.2", name: "Intramolecular Force and Potential Energy" },
      { id: "2.3", name: "Structure of Ionic Solids" },
      { id: "2.4", name: "Structure of Metals and Alloys" },
      { id: "2.5", name: "Lewis Diagrams" },
      { id: "2.6", name: "Resonance and Formal Charge" },
      { id: "2.7", name: "VSEPR and Hybridization" }
    ]
  },
  {
    id: Unit.Intermolecular,
    name: "Unit 3: Intermolecular Forces and Properties",
    subTopics: [
      { id: "3.1", name: "Intermolecular and Interparticle Forces" },
      { id: "3.2", name: "Properties of Solids" },
      { id: "3.3", name: "Solids, Liquids, and Gases" },
      { id: "3.4", name: "Ideal Gas Law" },
      { id: "3.5", name: "Kinetic Molecular Theory" },
      { id: "3.6", name: "Deviation from Ideal Gas Law" },
      { id: "3.7", name: "Solutions and Mixtures" },
      { id: "3.8", name: "Representations of Solutions" },
      { id: "3.9", name: "Separation of Solutions and Mixtures" },
      { id: "3.10", name: "Solubility" },
      { id: "3.11", name: "Spectroscopy and the Electromagnetic Spectrum" },
      { id: "3.12", name: "Properties of Photons" },
      { id: "3.13", name: "Beer-Lambert Law" }
    ]
  },
  {
    id: Unit.Reactions,
    name: "Unit 4: Chemical Reactions",
    subTopics: [
      { id: "4.1", name: "Introduction for Reactions" },
      { id: "4.2", name: "Net Ionic Equations" },
      { id: "4.3", name: "Representations of Reactions" },
      { id: "4.4", name: "Physical and Chemical Changes" },
      { id: "4.5", name: "Stoichiometry" },
      { id: "4.6", name: "Introduction to Titration" },
      { id: "4.7", name: "Types of Chemical Reactions" },
      { id: "4.8", name: "Introduction to Acid-Base Reactions" },
      { id: "4.9", name: "Oxidation-Reduction (Redox) Reactions" }
    ]
  },
  {
    id: Unit.Kinetics,
    name: "Unit 5: Kinetics",
    subTopics: [
      { id: "5.1", name: "Reaction Rates" },
      { id: "5.2", name: "Introduction to Rate Law" },
      { id: "5.3", name: "Concentration Changes Over Time" },
      { id: "5.4", name: "Elementary Reactions" },
      { id: "5.5", name: "Collision Model" },
      { id: "5.6", name: "Reaction Energy Profile" },
      { id: "5.7", name: "Introduction to Reaction Mechanisms" },
      { id: "5.8", name: "Reaction Mechanism and Rate Law" },
      { id: "5.9", name: "Steady-State Approximation" },
      { id: "5.10", name: "Multistep Reaction Energy Profile" },
      { id: "5.11", name: "Catalysis" }
    ]
  },
  {
    id: Unit.Thermo,
    name: "Unit 6: Thermodynamics",
    subTopics: [
      { id: "6.1", name: "Endothermic and Exothermic Processes" },
      { id: "6.2", name: "Energy Diagrams" },
      { id: "6.3", name: "Heat Transfer and Thermal Equilibrium" },
      { id: "6.4", name: "Heat Capacity and Calorimetry" },
      { id: "6.5", name: "Energy of Phase Changes" },
      { id: "6.6", name: "Introduction to Enthalpy of Reaction" },
      { id: "6.7", name: "Bond Enthalpies" },
      { id: "6.8", name: "Enthalpy of Formation" },
      { id: "6.9", name: "Hess's Law" }
    ]
  },
  {
    id: Unit.Equilibrium,
    name: "Unit 7: Equilibrium",
    subTopics: [
      { id: "7.1", name: "Introduction to Equilibrium" },
      { id: "7.2", name: "Direction of Reversible Reactions" },
      { id: "7.3", name: "Reaction Quotient and Equilibrium Constant" },
      { id: "7.4", name: "Calculating the Equilibrium Constant" },
      { id: "7.5", name: "Magnitude of the Equilibrium Constant" },
      { id: "7.6", name: "Properties of the Equilibrium Constant" },
      { id: "7.7", name: "Calculating Equilibrium Concentrations" },
      { id: "7.8", name: "Representations of Equilibrium" },
      { id: "7.9", name: "Introduction to Le Châtelier's Principle" },
      { id: "7.10", name: "Reaction Quotient and Le Châtelier's Principle" },
      { id: "7.11", name: "Introduction to Solubility Equilibria" },
      { id: "7.12", name: "Common-Ion Effect" }
    ]
  },
  {
    id: Unit.Acids,
    name: "Unit 8: Acids and Bases",
    subTopics: [
      { id: "8.1", name: "Introduction to Acids and Bases" },
      { id: "8.2", name: "pH and pOH of Strong Acids and Bases" },
      { id: "8.3", name: "Weak Acid and Base Equilibria" },
      { id: "8.4", name: "Acid-Base Reactions and Buffers" },
      { id: "8.5", name: "Acid-Base Titrations" },
      { id: "8.6", name: "Molecular Structure of Acids and Bases" },
      { id: "8.7", name: "pH and pKa" },
      { id: "8.8", name: "Properties of Buffers" },
      { id: "8.9", name: "Henderson-Hasselbalch Equation" },
      { id: "8.10", name: "Buffer Capacity" },
      { id: "8.11", name: "pH and Solubility" }
    ]
  },
  {
    id: Unit.Electro,
    name: "Unit 9: Thermodynamics and Electrochemistry",
    subTopics: [
      { id: "9.1", name: "Introduction to Entropy" },
      { id: "9.2", name: "Absolute Entropy and Entropy Change" },
      { id: "9.3", name: "Gibbs Free Energy and Thermodynamic Favorability" },
      { id: "9.4", name: "Thermodynamic and Kinetic Control" },
      { id: "9.5", name: "Free Energy and Equilibrium" },
      { id: "9.6", name: "Free Energy of Dissolution" },
      { id: "9.7", name: "Coupled Reactions" },
      { id: "9.8", name: "Galvanic (Voltaic) and Electrolytic Cells" },
      { id: "9.9", name: "Cell Potential and Free Energy" },
      { id: "9.10", name: "Cell Potential Under Nonstandard Conditions" },
      { id: "9.11", name: "Electrolysis and Faraday's Law" }
    ]
  }
];

export const FRQ_TYPES = [
  { id: FRQType.Short, name: "Short Answer Question (4 pts)", desc: "Focuses on a specific concept, calculation, or explanation within a concise timeframe." },
  { id: FRQType.Long, name: "Long Answer Question (10 pts)", desc: "Multipart problem requiring calculations, diagrams, and justifications, often integrating multiple topics." }
];
