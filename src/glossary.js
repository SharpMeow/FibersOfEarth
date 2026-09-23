import {glossary as definitions} from './content.js';
import extension from './data/glossary-extended.js';
const {additions:glossaryAdditions,depth:glossaryDepth}=extension;
import {createIndex} from './search.js';
export const reviewed='2026-09-22';
const cw=(slug,title)=>({title:'CottonWorks: '+title,url:'https://cottonworks.com/encyclopedia-item/'+slug+'/'});
export const glossarySources={
 card:cw('carding','Carding'),comb:cw('combing','Combing'),denier:cw('denier','Denier'),hand:cw('hand','Hand'),knit:cw('knitting','Knitting'),dye:cw('dyeing','Dyeing'),finish:cw('finishing','Finishing'),sliver:cw('sliver','Sliver'),staple:cw('staple-yarn','Staple yarn'),weave:cw('weaving','Weaving'),pill:cw('pilling','Pilling'),
 flax:{title:'Alliance for European Flax-Linen & Hemp: Flax growing and expertise',url:'https://allianceflaxlinenhemp.eu/en/flax-growing-expertise'},
 hemp:{title:'Alliance for European Flax-Linen & Hemp: Textile applications of hemp',url:'https://allianceflaxlinenhemp.eu/en/textile-applications-hemp'},
 flaxmap:{title:'Alliance: Mapping of processes for European flax-linen',url:'https://allianceflaxlinenhemp.eu/en/document_resources/13/download'},
 cashmere:{title:'Cashmere and Camel Hair Manufacturers Institute: Fiber definitions',url:'https://cashmere.org/definition-cashmere-wool.php'},
 scour:{title:'Woolmark: Scouring and carbonising',url:'https://www.woolmark.com/industry/product-development/wool-processing/woollen-scouring-carbonising/'},
 top:{title:'Woolmark: Worsted top-making',url:'https://www.woolmark.com/industry/product-development/wool-processing/worsted-top-making/'},
 wool:{title:'Woolmark: Wool processing',url:'https://www.woolmark.com/industry/use-wool/wool-processing/'},
 iwto:{title:'International Wool Textile Organisation: First-stage processing',url:'https://iwto.org/wool-supply-chain/first-stage-processing/'},
 micron:{title:'Woolmark: What is the wool fibre?',url:'https://www.woolmark.com/fibre/what-is-the-wool-fibre/'},
 pillcare:{title:'Woolmark: Pilling care factsheet',url:'https://www.woolmark.com/globalassets/_06-new-woolmark/_industry/certification/licensee-portal/gd5407-wool-care-factsheet_pilling.pdf'},
 lycra:{title:'The LYCRA Company: About LYCRA fiber',url:'https://one.lycra.com/en/lycra-frequently-asked-questions/about-lycra-fiber-website'},
 bisfa:{title:'BISFA: Terminology of man-made fibres (2017)',url:'https://bisfa.org/wp-content/uploads/2018/06/2017-BISFA-Terminology-final.pdf'},
 lenzing:{title:'Lenzing: Fiber production technologies',url:'https://www.lenzing.com/technology-production/technologies/'},
 gin:{title:'CottonWorks: Cotton growth, harvesting and ginning',url:'https://cottonworks.com/fiber/fiber-science/cotton-fiber-growth-harvesting-and-ginning/'},
 weavebasics:{title:'CottonWorks: Weaving basics',url:'https://cottonworks.com/learning-hub/weaving/weaving-basics/'},
 custody:{title:'Textile Exchange: Supply-chain certification',url:'https://textileexchange.org/get-certified/supply-chain/'},
 toolkit:{title:'Textile Exchange: Brand and retailer certification toolkit (2020)',url:'https://textileexchange.org/app/uploads/2022/11/TE-402-V1.0-Brand-and-Retailer-Certification-Toolkit.pdf'},
 policies:{title:'Textile Exchange: Standards policy and resource updates',url:'https://hub.textileexchange.org/home/site-wide-content/standards-policy-updates'},
 drape:{title:'NC State: Kawabata Evaluation System',url:'https://textiles.ncsu.edu/tpacc/comfort-performance/kawabata-evaluation-system/'},
 weights:{title:'Craft Yarn Council: Standard Yarn Weight System',url:'https://media.craftyarncouncil.com/standards/yarn-weight-system'}
};
// Original explanations and illustrative examples. References support the technical basis;
// examples are teaching scenarios, not evidence about a particular product.
const rows=[
['Bast fiber','Fiber structure','bast fibres, stem fiber',
'Bast describes where a fiber occurs in a plant. Flax and hemp provide bundles of strong supporting fibers in their stems. Processing separates those bundles from surrounding tissue and woody material before preparing them for yarn. A textile strand may still contain several associated cells, so a visible strand is not necessarily one elementary fiber.',
'A linen shirt starts with a stem-derived fiber; a cotton shirt starts with seed hairs. Both contain cellulose, but their extraction and preparation routes differ. This distinction helps explain why a flax journey includes retting and scutching while a cotton journey includes ginning.',
'Bast is a botanical category, not a guarantee of softness, organic cultivation or low impact. Ask which plant, preparation method and finished construction the description refers to.',['Retting','Scutching','Cottonization'],['flax','hemp']],
['Carding','Processing','carded, carded cotton',
'Carding opens a mass of fibers, separates tangles and produces a more manageable arrangement for later processing. Wire-covered surfaces help distribute the fibers; the output may be a web or a sliver, depending on the production system. Carding is a preparation step rather than the operation that makes a finished, twisted yarn.',
'Two cotton yarns can both be carded, while only one receives an additional combing step. On a mill specification, “carded” therefore describes preparation. It does not tell you the yarn count, twist, fabric weight or how the finished garment will feel after washing.',
'Do not treat carded as synonymous with low quality. The appropriate preparation depends on the intended yarn and fabric. Compare the actual finished textile and its performance requirements.',['Combing','Sliver','Worsted'],['card','wool']],
['Chain of custody','Claims & sourcing','CoC, certified supply chain',
'A chain-of-custody system connects a material claim to records and controls as goods pass between organizations. Under Textile Exchange certification, relevant supply-chain participants and transaction documentation help maintain the claimed material content through processing and trade. The exact rules depend on the standard and its current version.',
'Imagine a spinner buying certified recycled fiber. Evidence needs to connect the incoming material, processing records and outgoing yarn claim. A supplier’s general certificate and documentation for a particular shipment answer different questions. Request evidence that matches the goods you are evaluating.',
'A certification logo is not a complete account of every environmental or labor issue. Read its scope. Chain of custody supports specified claims; it should not be expanded into unrelated guarantees.',['Traceability','Pre-consumer','Post-consumer'],['custody']],
['Combing','Processing','combed cotton, combed wool, noil',
'Combing selects and prepares a fiber population after earlier opening and carding. It removes shorter fibers and helps arrange the retained fibers for subsequent yarn production. In wool processing it also removes neps and residual vegetable matter. The shorter material removed during wool combing is called noil and may enter other textile routes.',
'A combed cotton shirt and a carded cotton shirt can share the same fiber composition but use different yarn preparation. Compare their surface, construction and washing behavior rather than assuming that the extra processing step determines every aspect of quality.',
'Combing is not the same as shearing or dehairing. It primarily prepares textile fibers for spinning; dehairing separates the coarse and fine components of certain animal coats.',['Carding','Top','Dehairing'],['comb','top']],
['Cottonization','Processing','cottonisation, cottonized hemp, cottonised flax',
'Cottonization adapts bast fibers to shorter-staple processing systems. The route can involve opening, shortening and refining fiber bundles, using mechanical and sometimes wet-processing steps. Its purpose is compatibility with equipment and blends, rather than changing the plant species or turning hemp or flax into cotton.',
'A spinner might blend cottonized hemp with cotton to use an established short-staple production line. The resulting yarn still contains hemp. The blend ratio, remaining bundle size and processing conditions help determine its suitability for the planned fabric.',
'Cottonized is a process description, not a fiber-content claim. It also differs from regenerated cellulose, where cellulose is dissolved and formed into a new fiber. Ask for the actual composition and preparation route.',['Bast fiber','Staple','Regenerated cellulose'],['hemp','flaxmap']],
['Dehairing','Processing','dehaired, undercoat separation',
'Dehairing separates the fine undercoat sought for textiles from the coarser outer hairs present in some animal fleeces. Cashmere is associated with the fine, dehaired undercoat of the cashmere goat. Separation matters because an average description of a fleece can conceal very different fiber populations.',
'When discussing a cashmere lot, ask whether measurements describe the raw mixed fleece or the prepared textile fiber. A soft-looking photograph cannot establish how effectively coarse hairs were removed. Composition and diameter information provide different pieces of evidence.',
'Dehairing is not simply another name for washing, nor does it mean that every remaining fiber has an identical diameter. Avoid judging finished comfort from a process name alone; yarn construction and surface finishing also matter.',['Guard hair','Micron','Scouring'],['cashmere']],
['Denier','Measurements','den, D, linear density',
'Denier measures mass per length: a 9,000-meter length with a mass of 1 gram is 1 denier. A larger number means more mass for the same length. The unit may describe an individual filament or a whole yarn, so the object being measured must accompany the number.',
