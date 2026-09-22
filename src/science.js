export const scienceTopics=[
 ['chemistry','The chemistry of a thread','Cellulose, proteins and engineered polymers behave differently.','Plant fibers such as cotton and flax are rich in cellulose. Wool and other mammal hair are keratin-based; silk is primarily fibroin. Manufactured fibers may regenerate a natural polymer, chemically modify it, or build a synthetic polymer. These categories describe chemistry, not a complete environmental ranking.'],
 ['structure','From a molecule to a garment','Scale matters at every step.','Polymer arrangement, fiber diameter, length, cross-section and surface all influence performance. Spinning changes alignment and twist; weaving or knitting changes porosity and stretch; finishing changes the surface. A fiber name cannot predict the behavior of a whole garment.'],
 ['moisture','Absorbency is not the same as wicking','Water can enter a fiber or move through the spaces around it.','Moisture regain describes water held relative to dry fiber mass under specified conditions. Wicking is liquid transport through a textile structure. Drying also depends on fabric mass, construction, airflow and humidity. A low-absorbency fiber can still be engineered into a fabric that transports moisture.'],
 ['strength','Strong, tough, stiff: three different questions','A useful material property always comes with a test condition.','Strength concerns the load a material tolerates before failure. Stiffness describes resistance to deformation. Toughness includes the energy absorbed before breaking. Abrasion, repeated flexing and wet conditions create additional questions. A high tensile result alone does not establish garment durability.'],
 ['warmth','Warmth lives in the structure','Much of textile insulation comes from trapped, relatively still air.','Crimp, loft, yarn bulk and fabric construction affect the air held in a textile. Wind and moisture can change the result. Comparing warmth requires comparable thickness, mass, construction and test conditions, so a universal warmth ranking by fiber name is misleading.'],
 ['end-of-life','Biodegradable, recyclable, compostable','Three claims with different conditions.','Biodegradation depends on material chemistry and the surrounding conditions. Compostability refers to a defined system and criteria. Recyclability requires a process and a real collection pathway. Dyes, coatings, blends and contamination affect the whole product even when the base fiber has a promising property.']
];
export const chemistry={
 Plant:['Cellulose-rich plant material','Seed, stem, leaf or other plant structure. Extraction and preparation vary.'],
 Animal:['Protein-based natural material','Most hair is keratin; silk is a different protein-fiber system.'],
 Cellulosic:['Manufactured cellulose family','Regenerated cellulose or a cellulose derivative, depending on the fiber.'],
 Synthetic:['Engineered organic polymer','Polymer chemistry and fiber-forming conditions determine the starting material.'],
 Recycled:['Recovered material, retained chemistry','Recycled describes the feedstock history, not a new polymer family.'],
 Technical:['Application-specific engineered material','Read the exact polymer, precursor and grade before comparing performance.'],
 'Mineral & metal':['Inorganic material','Composition, filament size and product form determine properties and handling.'],
 'Bio-based':['Manufactured from biological inputs','Feedstock origin does not establish biodegradability or a particular impact.'],
 'Regenerated protein':['Reformed protein material','A protein feedstock is processed and formed into a manufactured fiber.'],
 Specialty:['Species or trade-specific material','Public specifications and independently verified sourcing can be limited.']
};
export function diameterFromDenier(denier,density){return Math.sqrt(4000*denier/(9*Math.PI*density));}
export function scienceFor(m){
 if(['silk','eri-silk','tussar-silk','muga-silk'].includes(m.id))return ['Protein: fibroin','Silkworms form a protein filament. Reeling, spinning and degumming change its textile form.'];
 if(['acetate','triacetate'].includes(m.id))return ['Cellulose ester','Cellulose is chemically modified by acetylation. This is different from regenerating cellulose as viscose or lyocell.'];
 return chemistry[m.family]||['Product-specific structure','Follow the linked underlying material, then consult the exact producer specification.'];
}
// Yarn and fiber linear density. Direct systems (mass per length) and indirect systems (length per mass)
// all pass through tex, grams per 1,000 meters. Ne: 840-yard hanks per pound, so tex = 453.59237/(0.9144*840)*1000/Ne.
const NE=453.59237e3/(0.9144*840);
export const countUnits=[['tex','tex (g per 1,000 m)'],['dtex','dtex (g per 10,000 m)'],['denier','denier (g per 9,000 m)'],['nm','Nm, metric count (km per kg)'],['ne','Ne, English cotton count']];
export function toTex(value,unit){const v=Number(value);if(!(v>0))return NaN;return {tex:v,dtex:v/10,denier:v/9,nm:1000/v,ne:NE/v}[unit]??NaN;}
export function fromTex(tex,unit){if(!(tex>0))return NaN;return {tex,dtex:tex*10,denier:tex*9,nm:1000/tex,ne:NE/tex}[unit]??NaN;}
// Fabric mass per area. 1 oz/yd2 = 28.349523125 g / 0.83612736 m2. One momme is the weight in pounds of a
// piece 45 inches by 100 yards, which works out to about 4.34 g/m2.
const OZ=28.349523125/0.83612736,MOMME=453.59237/(1.143*91.44);
export const weightUnits=[['gsm','g/m² (GSM)'],['oz','oz/yd²'],['momme','momme (silk)']];
export function toGsm(value,unit){const v=Number(value);if(!(v>0))return NaN;return {gsm:v,oz:v*OZ,momme:v*MOMME}[unit]??NaN;}
export function fromGsm(gsm,unit){if(!(gsm>0))return NaN;return {gsm,oz:gsm/OZ,momme:gsm/MOMME}[unit]??NaN;}
