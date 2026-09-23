// Editorial material profiles. Routes illustrate possible sequences, not tracked shipments.
export const sources = [
 {id:'woolmark',name:'The Woolmark Company',title:'Wool processing',url:'https://www.woolmark.com/industry/use-wool/wool-processing/',note:'Technical reference for scouring, carding, combing, spinning and fabric formation.'},
 {id:'flax',name:'Alliance for European Flax-Linen & Hemp',title:'All about European flax',url:'https://allianceflaxlinenhemp.eu/en/all-about-european-linen',note:'Industry reference for flax geography, fiber extraction and linen terminology.'},
 {id:'lenzing',name:'Lenzing',title:'Fiber production technologies',url:'https://www.lenzing.com/technology-production/technologies/',note:'Producer explanation of lyocell, viscose and modal. Its process claims describe its own operations.'},
 {id:'exchange',name:'Textile Exchange',title:'Materials Market Report 2025',url:'https://textileexchange.org/knowledge-center/reports/materials-market-report-2025/',note:'2024 global production data, published September 2025. This is a dated snapshot, not a live counter.'},
 {id:'standards',name:'Textile Exchange',title:'Material standards',url:'https://textileexchange.org/standards/',note:'Official entry point for scope, claims and current versions of material standards.'},
 {id:'sfa',name:'Sustainable Fibre Alliance',title:'Standards and resources',url:'https://sustainablefibre.org/resources/',note:'Cashmere sourcing, primary processing and chain-of-custody reference.'},
 {id:'fao',name:'Food and Agriculture Organization',title:'Harvesting of textile animal fibres',url:'https://www.fao.org/4/v9384e/v9384e00.htm',note:'Historical technical reference. Not used as a source of current market shares or trade flows.'},
 {id:'jute',name:'Food and Agriculture Organization',title:'Jute and hard fibres',url:'https://www.fao.org/markets-and-trade/commodities-overview/fibres/jute-and-hard-fibres/',note:'Commodity background and end-use reference.'},
 {id:'ramie',name:'Food and Agriculture Organization',title:'Boehmeria nivea crop profile',url:'https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id=3746',note:'Botanical and agricultural reference for ramie.'},
 {id:'qiviut',name:'Musk Ox Farm',title:'Qiviut in Palmer, Alaska',url:'https://www.muskoxfarm.org/',note:'A specific example of musk ox husbandry and hand-combed qiviut, not proof of every Arctic route.'},
 {id:'cites',name:'CITES',title:'Vicuña and international trade',url:'https://cites.org/eng',note:'Consult current species listings and national authorities for actual trade requirements.'},
 {id:'map',name:'Natural Earth / World Atlas',title:'World map geometry',url:'https://github.com/topojson/world-atlas',note:'Bundled generalized map data. City markers are approximate and do not identify suppliers.'}
];
// name, family, descriptor, composition, feel, uses, care, tradeoff, question, source IDs
const entries = {
 wool:['Merino wool','Animal','From open pasture to considered clo