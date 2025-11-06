// Data structure now supports Taluka between District and City/Village
export const indiaLocations = [
  {
    state: 'Maharashtra',
    districts: [
      { 
        name: 'Pune', 
        talukas: [
          { name: 'pune', places: ['Pune', 'Baramati', 'Lonavala'] }
        ]
      },
      { 
        name: 'Mumbai Suburban', 
        talukas: [
          { name: 'mumbai', places: ['Andheri', 'Bandra', 'Borivali'] },
          { name: 'old mumbai', places: ['Andheri', 'Bandra', 'Borivali', 'Goregaav'] }
        ]
      },
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      { name: 'Patan', talukas: [ { name: 'Patan', places: ['Patan','Sidhpur', 'Radhanpur', 'Sami', 'Harij', 'Chanasma'] } ] },
        {
          name: 'Mehsana',
          talukas: [
            {
              name: 'Mehsana',
              places: ['Ajabpura','Akhaj','Aloda','Ambaliyasan','Ambasan','Badalpura','Baliyasan','Balol','Balvantpura','Bamosana','kherva']
            },
            {
              name: 'Kadi',
              places: ['Achrasan','Adaraj','Adundara','Agol','Bharkhali','Budhpura','Chandiyala','Dandi','Dediyasan (Kadi)','Dholka (?)']
            },
            {
              name: 'Visnagar',
              places: ['Bhandu','Bhathigam','Bhildadar','Dhorkin','Gojariya','Gothada','Kherol','Kudasan','Malpur','Morva Hadaf']
            },
            {
              name: 'Vijapur',
              places: ['Dholasan','Juna Sedhavi','Langhnaj','Mitha','Modipur','Motidau','Palaj','Rampura (Katosan)','Sakharpurda','Tavadiya']
            },
            {
              name: 'Vadnagar',
              places: ['Akhaj','Dixitpura','Hatnoor','Katosan','Kherol','Manpura','Rampura (Vadnagar)','Rupal','Sanganpur','Ucharpi']
            },
            {
              name: 'Kheralu',
              places: ['Delol','Dhinoj','Gadu','Gorasana','Khara','Kherva','Rampar','Rasikpura','Satlasana (?)','Unad']
            },
            {
              name: 'Becharaji',
              places: ['Jagudan','Mandali','Mandal','Rajpura','Sami','Vadtal (?)','Varnama (?)','Vejalpur (?)','Vinchhiya (?)','Zundal (?)']
            },
            {
              name: 'Satlasana',
              places: ['Satlasana','Vadagam','Undel','Gujapura','Katosan','Saldi','Tejpura','Taleti','Virampura','Virasan (?)']
            },
            {
              name: 'Jotana',
              places: ['Jotana','Amoda','Chandial','Dhanali','Kanpura','Martoli','Manknaj','Modipur','Mudarda','Rampura (Katosan)']
            },
            {
              name: 'Unjha',
              places: ['Unjha','Dabhi','Kansari','Mahesana Rural','Rantej','Ranipura','Sakharpurda','Sobhasan','Virsoda','Virta']
            }
          ]
        },
      { name: 'Ahmedabad', talukas: [ { name: 'Ahmedabad', places: ['Odhav', 'Bhat', 'Visalpur', 'Dholka', 'Sanand'] } ] },
      { name: 'Surat', talukas: [ { name: 'Surat', places: ['Bardoli', 'Vyara', 'Mandvi', 'Olpad', 'Kamrej'] } ] },
      { name: 'Rajkot', talukas: [ { name: 'Rajkot', places: ['Jetpur', 'Upleta', 'Paddhari', 'Lodhika', 'Kotda Sangani'] } ] },
      { name: 'Bhavnagar', talukas: [ { name: 'Bhavnagar', places: ['Gariadhar', 'Talaja', 'Umrala', 'Mahuva', 'Palitana'] } ] },
      { name: 'Gandhinagar', talukas: [ { name: 'Gandhinagar', places: ['Dehgam', 'Mansa', 'Kalol', 'Adalaj', 'Pethapur'] } ] },
      { name: 'Navsari', talukas: [ { name: 'Navsari', places: ['Vansda', 'Chikhli', 'Jalalpore', 'Gandevi', 'Khergam'] } ] },
      { name: 'Bharuch', talukas: [ { name: 'Bharuch', places: ['Ankleshwar', 'Amod', 'Valia', 'Hansot', 'Jambusar'] } ] },
      { name: 'Anand', talukas: [ { name: 'Anand', places: ['Borsad', 'Umreth', 'Sojitra', 'Petlad', 'Tarapur'] } ] },
      { name: 'Vadodara', talukas: [ { name: 'Vadodara', places: ['Padra', 'Karjan', 'Waghodia', 'Savli', 'Dabhoi'] } ] },
      { name: 'Narmada', talukas: [ { name: 'Narmada', places: ['Rajpipla', 'Dediapada', 'Tilakwada', 'Garudeshwar', 'Nandod'] } ] },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      { name: 'Lucknow', talukas: [ { name: 'Default', places: ['Lucknow', 'Malihabad', 'Mohanlalganj'] } ] },
      { name: 'Varanasi', talukas: [ { name: 'Default', places: ['Varanasi', 'Ramnagar', 'Sarnath'] } ] },
    ],
  },
];

export function getStates() {
  return indiaLocations.map((s) => s.state);
}

export function getDistricts(state) {
  const s = indiaLocations.find((x) => x.state === state);
  return s ? s.districts.map((d) => d.name) : [];
}

export function getTalukas(state, district) {
  const s = indiaLocations.find((x) => x.state === state);
  const d = s?.districts.find((y) => y.name === district);
  return d ? d.talukas.map(t => t.name) : [];
}

export function getPlaces(state, district, taluka) {
  const s = indiaLocations.find((x) => x.state === state);
  const d = s?.districts.find((y) => y.name === district);
  const t = d?.talukas.find((z) => z.name === taluka);
  return t ? t.places : [];
}

// Backward compatibility: treat places as cities for existing consumers
export function getCities(state, district) {
  const talukas = getTalukas(state, district);
  if (!talukas.length) return [];
  // Merge all places from all talukas for older callers
  const places = talukas.flatMap(name => getPlaces(state, district, name));
  // Ensure unique
  return Array.from(new Set(places));
}
