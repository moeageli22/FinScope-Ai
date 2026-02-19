import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import { supabase } from '../config/supabase';
import { useToast } from '../components/Toast';

// Country data with flags and major cities
const COUNTRY_DATA = [
    { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', cities: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif'] },
    { code: 'AL', name: 'Albania', flag: '🇦🇱', cities: ['Tirana', 'Durrës', 'Vlorë', 'Shkodër'] },
    { code: 'DZ', name: 'Algeria', flag: '🇩🇿', cities: ['Algiers', 'Oran', 'Constantine', 'Annaba'] },
    { code: 'AD', name: 'Andorra', flag: '🇦🇩', cities: ['Andorra la Vella', 'Escaldes-Engordany'] },
    { code: 'AO', name: 'Angola', flag: '🇦🇴', cities: ['Luanda', 'Huambo', 'Lobito', 'Benguela'] },
    { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬', cities: ["Saint John's"] },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Tucumán', 'La Plata', 'Mar del Plata'] },
    { code: 'AM', name: 'Armenia', flag: '🇦🇲', cities: ['Yerevan', 'Gyumri', 'Vanadzor'] },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Hobart', 'Darwin'] },
    { code: 'AT', name: 'Austria', flag: '🇦🇹', cities: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'] },
    { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', cities: ['Baku', 'Ganja', 'Sumqayit'] },
    { code: 'BS', name: 'Bahamas', flag: '🇧🇸', cities: ['Nassau', 'Freeport'] },
    { code: 'BH', name: 'Bahrain', flag: '🇧🇭', cities: ['Manama', 'Riffa', 'Muharraq'] },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', cities: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'] },
    { code: 'BB', name: 'Barbados', flag: '🇧🇧', cities: ['Bridgetown'] },
    { code: 'BY', name: 'Belarus', flag: '🇧🇾', cities: ['Minsk', 'Homiel', 'Mahilyow', 'Vitebsk', 'Hrodna'] },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪', cities: ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liège'] },
    { code: 'BZ', name: 'Belize', flag: '🇧🇿', cities: ['Belmopan', 'Belize City'] },
    { code: 'BJ', name: 'Benin', flag: '🇧🇯', cities: ['Cotonou', 'Porto-Novo', 'Parakou'] },
    { code: 'BT', name: 'Bhutan', flag: '🇧🇹', cities: ['Thimphu', 'Phuntsholing'] },
    { code: 'BO', name: 'Bolivia', flag: '🇧🇴', cities: ['Sucre', 'La Paz', 'Santa Cruz', 'Cochabamba'] },
    { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦', cities: ['Sarajevo', 'Banja Luka', 'Tuzla', 'Mostar'] },
    { code: 'BW', name: 'Botswana', flag: '🇧🇼', cities: ['Gaborone', 'Francistown', 'Maun'] },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'] },
    { code: 'BN', name: 'Brunei', flag: '🇧🇳', cities: ['Bandar Seri Begawan'] },
    { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', cities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'] },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', cities: ['Ouagadougou', 'Bobo-Dioulasso'] },
    { code: 'BI', name: 'Burundi', flag: '🇧🇮', cities: ['Gitega', 'Bujumbura'] },
    { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻', cities: ['Praia', 'Mindelo'] },
    { code: 'KH', name: 'Cambodia', flag: '🇰🇭', cities: ['Phnom Penh', 'Siem Reap', 'Sihanoukville'] },
    { code: 'CM', name: 'Cameroon', flag: '🇨🇲', cities: ['Yaoundé', 'Douala', 'Bamenda'] },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Halifax', 'Victoria'] },
    { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', cities: ['Bangui'] },
    { code: 'TD', name: 'Chad', flag: '🇹🇩', cities: ["N'Djamena", 'Moundou', 'Sarh'] },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', cities: ['Santiago', 'Valparaíso', 'Concepción', 'Antofagasta'] },
    { code: 'CN', name: 'China', flag: '🇨🇳', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Chongqing', 'Tianjin', 'Wuhan', 'Hangzhou', 'Nanjing', 'Xi\'an', 'Suzhou'] },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴', cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'] },
    { code: 'KM', name: 'Comoros', flag: '🇰🇲', cities: ['Moroni'] },
    { code: 'CG', name: 'Congo', flag: '🇨🇬', cities: ['Brazzaville', 'Pointe-Noire'] },
    { code: 'CD', name: 'Congo (DRC)', flag: '🇨🇩', cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga'] },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', cities: ['San José', 'Alajuela', 'Cartago', 'Heredia'] },
    { code: 'HR', name: 'Croatia', flag: '🇭🇷', cities: ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Dubrovnik'] },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺', cities: ['Havana', 'Santiago de Cuba', 'Camagüey', 'Holguín'] },
    { code: 'CY', name: 'Cyprus', flag: '🇨🇾', cities: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'] },
    { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', cities: ['Prague', 'Brno', 'Ostrava', 'Plzeň'] },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰', cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'] },
    { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', cities: ['Djibouti City'] },
    { code: 'DM', name: 'Dominica', flag: '🇩🇲', cities: ['Roseau'] },
    { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', cities: ['Santo Domingo', 'Santiago', 'La Romana'] },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨', cities: ['Quito', 'Guayaquil', 'Cuenca'] },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Luxor', 'Aswan'] },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻', cities: ['San Salvador', 'Santa Ana', 'Soyapango'] },
    { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', cities: ['Malabo', 'Bata'] },
    { code: 'ER', name: 'Eritrea', flag: '🇪🇷', cities: ['Asmara', 'Keren'] },
    { code: 'EE', name: 'Estonia', flag: '🇪🇪', cities: ['Tallinn', 'Tartu', 'Narva', 'Pärnu'] },
    { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', cities: ['Mbabane', 'Manzini'] },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', cities: ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Hawassa'] },
    { code: 'FJ', name: 'Fiji', flag: '🇫🇯', cities: ['Suva', 'Nadi', 'Lautoka'] },
    { code: 'FI', name: 'Finland', flag: '🇫🇮', cities: ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku'] },
    { code: 'FR', name: 'France', flag: '🇫🇷', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Montpellier'] },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦', cities: ['Libreville', 'Port-Gentil'] },
    { code: 'GM', name: 'Gambia', flag: '🇬🇲', cities: ['Banjul', 'Serekunda'] },
    { code: 'GE', name: 'Georgia', flag: '🇬🇪', cities: ['Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi'] },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nuremberg'] },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi'] },
    { code: 'GR', name: 'Greece', flag: '🇬🇷', cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Rhodes'] },
    { code: 'GD', name: 'Grenada', flag: '🇬🇩', cities: ["Saint George's"] },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹', cities: ['Guatemala City', 'Quetzaltenango', 'Mixco'] },
    { code: 'GN', name: 'Guinea', flag: '🇬🇳', cities: ['Conakry', 'Nzérékoré', 'Kankan'] },
    { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', cities: ['Bissau'] },
    { code: 'GY', name: 'Guyana', flag: '🇬🇾', cities: ['Georgetown', 'Linden'] },
    { code: 'HT', name: 'Haiti', flag: '🇭🇹', cities: ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves'] },
    { code: 'HN', name: 'Honduras', flag: '🇭🇳', cities: ['Tegucigalpa', 'San Pedro Sula', 'Choloma'] },
    { code: 'HU', name: 'Hungary', flag: '🇭🇺', cities: ['Budapest', 'Debrecen', 'Miskolc', 'Szeged', 'Pécs'] },
    { code: 'IS', name: 'Iceland', flag: '🇮🇸', cities: ['Reykjavik', 'Akureyri', 'Kópavogur'] },
    { code: 'IN', name: 'India', flag: '🇮🇳', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore', 'Thane', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad'] },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Tangerang', 'Depok', 'Denpasar'] },
    { code: 'IR', name: 'Iran', flag: '🇮🇷', cities: ['Tehran', 'Mashhad', 'Isfahan', 'Karaj', 'Tabriz', 'Shiraz'] },
    { code: 'IQ', name: 'Iraq', flag: '🇮🇶', cities: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Najaf'] },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪', cities: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'] },
    { code: 'IL', name: 'Israel', flag: '🇮🇱', cities: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Rishon LeZion', 'Petah Tikva', 'Be\'er Sheva'] },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice', 'Bari', 'Catania', 'Verona'] },
    { code: 'JM', name: 'Jamaica', flag: '🇯🇲', cities: ['Kingston', 'Montego Bay', 'Portmore'] },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', cities: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai'] },
    { code: 'JO', name: 'Jordan', flag: '🇯🇴', cities: ['Amman', 'Zarqa', 'Irbid', 'Aqaba'] },
    { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', cities: ['Almaty', 'Nur-Sultan', 'Shymkent', 'Aktobe'] },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
    { code: 'KI', name: 'Kiribati', flag: '🇰🇮', cities: ['South Tarawa'] },
    { code: 'KW', name: 'Kuwait', flag: '🇰🇼', cities: ['Kuwait City', 'Al Ahmadi', 'Hawalli'] },
    { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', cities: ['Bishkek', 'Osh', 'Jalal-Abad'] },
    { code: 'LA', name: 'Laos', flag: '🇱🇦', cities: ['Vientiane', 'Luang Prabang', 'Savannakhet'] },
    { code: 'LV', name: 'Latvia', flag: '🇱🇻', cities: ['Riga', 'Daugavpils', 'Liepāja'] },
    { code: 'LB', name: 'Lebanon', flag: '🇱🇧', cities: ['Beirut', 'Tripoli', 'Sidon', 'Tyre'] },
    { code: 'LS', name: 'Lesotho', flag: '🇱🇸', cities: ['Maseru', 'Teyateyaneng'] },
    { code: 'LR', name: 'Liberia', flag: '🇱🇷', cities: ['Monrovia', 'Gbarnga', 'Kakata'] },
    { code: 'LY', name: 'Libya', flag: '🇱🇾', cities: ['Tripoli', 'Benghazi', 'Misrata'] },
    { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', cities: ['Vaduz', 'Schaan'] },
    { code: 'LT', name: 'Lithuania', flag: '🇱🇹', cities: ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai'] },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', cities: ['Luxembourg City', 'Esch-sur-Alzette', 'Differdange'] },
    { code: 'MG', name: 'Madagascar', flag: '🇲🇬', cities: ['Antananarivo', 'Toamasina', 'Antsirabe'] },
    { code: 'MW', name: 'Malawi', flag: '🇲🇼', cities: ['Lilongwe', 'Blantyre', 'Mzuzu'] },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', cities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Johor Bahru', 'Kota Kinabalu', 'Kuching'] },
    { code: 'MV', name: 'Maldives', flag: '🇲🇻', cities: ['Malé', 'Addu City'] },
    { code: 'ML', name: 'Mali', flag: '🇲🇱', cities: ['Bamako', 'Sikasso', 'Mopti'] },
    { code: 'MT', name: 'Malta', flag: '🇲🇹', cities: ['Valletta', 'Birkirkara', 'Mosta'] },
    { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭', cities: ['Majuro', 'Ebeye'] },
    { code: 'MR', name: 'Mauritania', flag: '🇲🇷', cities: ['Nouakchott', 'Nouadhibou'] },
    { code: 'MU', name: 'Mauritius', flag: '🇲🇺', cities: ['Port Louis', 'Beau Bassin', 'Vacoas'] },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'Cancún'] },
    { code: 'FM', name: 'Micronesia', flag: '🇫🇲', cities: ['Palikir'] },
    { code: 'MD', name: 'Moldova', flag: '🇲🇩', cities: ['Chișinău', 'Tiraspol', 'Bălți'] },
    { code: 'MC', name: 'Monaco', flag: '🇲🇨', cities: ['Monaco'] },
    { code: 'MN', name: 'Mongolia', flag: '🇲🇳', cities: ['Ulaanbaatar', 'Erdenet', 'Darkhan'] },
    { code: 'ME', name: 'Montenegro', flag: '🇲🇪', cities: ['Podgorica', 'Nikšić', 'Herceg Novi'] },
    { code: 'MA', name: 'Morocco', flag: '🇲🇦', cities: ['Casablanca', 'Rabat', 'Fes', 'Marrakesh', 'Agadir', 'Tangier', 'Meknes'] },
    { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', cities: ['Maputo', 'Matola', 'Nampula', 'Beira'] },
    { code: 'MM', name: 'Myanmar', flag: '🇲🇲', cities: ['Naypyidaw', 'Yangon', 'Mandalay', 'Mawlamyine'] },
    { code: 'NA', name: 'Namibia', flag: '🇳🇦', cities: ['Windhoek', 'Rundu', 'Walvis Bay'] },
    { code: 'NR', name: 'Nauru', flag: '🇳🇷', cities: ['Yaren'] },
    { code: 'NP', name: 'Nepal', flag: '🇳🇵', cities: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Biratnagar'] },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere'] },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'] },
    { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', cities: ['Managua', 'León', 'Masaya'] },
    { code: 'NE', name: 'Niger', flag: '🇳🇪', cities: ['Niamey', 'Zinder', 'Maradi'] },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', cities: ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Kaduna'] },
    { code: 'MK', name: 'North Macedonia', flag: '🇲🇰', cities: ['Skopje', 'Bitola', 'Kumanovo'] },
    { code: 'NO', name: 'Norway', flag: '🇳🇴', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø'] },
    { code: 'OM', name: 'Oman', flag: '🇴🇲', cities: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'] },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', cities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'] },
    { code: 'PW', name: 'Palau', flag: '🇵🇼', cities: ['Ngerulmud', 'Koror'] },
    { code: 'PA', name: 'Panama', flag: '🇵🇦', cities: ['Panama City', 'San Miguelito', 'Colón'] },
    { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', cities: ['Port Moresby', 'Lae', 'Mount Hagen'] },
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾', cities: ['Asunción', 'Ciudad del Este', 'San Lorenzo'] },
    { code: 'PE', name: 'Peru', flag: '🇵🇪', cities: ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Cusco'] },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', cities: ['Manila', 'Quezon City', 'Davao', 'Caloocan', 'Cebu City', 'Zamboanga', 'Taguig', 'Antipolo', 'Pasig'] },
    { code: 'PL', name: 'Poland', flag: '🇵🇱', cities: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin'] },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', cities: ['Lisbon', 'Porto', 'Braga', 'Amadora', 'Setúbal', 'Coimbra', 'Funchal'] },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦', cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'] },
    { code: 'RO', name: 'Romania', flag: '🇷🇴', cities: ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Brașov'] },
    { code: 'RU', name: 'Russia', flag: '🇷🇺', cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Voronezh'] },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼', cities: ['Kigali', 'Butare', 'Gitarama'] },
    { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳', cities: ['Basseterre'] },
    { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨', cities: ['Castries'] },
    { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨', cities: ['Kingstown'] },
    { code: 'WS', name: 'Samoa', flag: '🇼🇸', cities: ['Apia'] },
    { code: 'SM', name: 'San Marino', flag: '🇸🇲', cities: ['San Marino', 'Serravalle'] },
    { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', cities: ['São Tomé'] },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Abha'] },
    { code: 'SN', name: 'Senegal', flag: '🇸🇳', cities: ['Dakar', 'Touba', 'Thiès', 'Kaolack'] },
    { code: 'RS', name: 'Serbia', flag: '🇷🇸', cities: ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac'] },
    { code: 'SC', name: 'Seychelles', flag: '🇸🇨', cities: ['Victoria'] },
    { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', cities: ['Freetown', 'Bo', 'Kenema'] },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', cities: ['Singapore'] },
    { code: 'SK', name: 'Slovakia', flag: '🇸🇰', cities: ['Bratislava', 'Košice', 'Prešov', 'Žilina'] },
    { code: 'SI', name: 'Slovenia', flag: '🇸🇮', cities: ['Ljubljana', 'Maribor', 'Celje'] },
    { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧', cities: ['Honiara'] },
    { code: 'SO', name: 'Somalia', flag: '🇸🇴', cities: ['Mogadishu', 'Hargeisa', 'Bosaso'] },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Polokwane'] },
    { code: 'SS', name: 'South Sudan', flag: '🇸🇸', cities: ['Juba', 'Wau', 'Malakal'] },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Granada'] },
    { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', cities: ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo'] },
    { code: 'SD', name: 'Sudan', flag: '🇸🇩', cities: ['Khartoum', 'Omdurman', 'Port Sudan'] },
    { code: 'SR', name: 'Suriname', flag: '🇸🇷', cities: ['Paramaribo', 'Lelydorp'] },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪', cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping'] },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭', cities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne'] },
    { code: 'SY', name: 'Syria', flag: '🇸🇾', cities: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama'] },
    { code: 'TW', name: 'Taiwan', flag: '🇹🇼', cities: ['Taipei', 'New Taipei', 'Kaohsiung', 'Taichung', 'Tainan'] },
    { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', cities: ['Dushanbe', 'Khujand', 'Kulob'] },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', cities: ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Zanzibar City'] },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', cities: ['Bangkok', 'Nonthaburi', 'Pak Kret', 'Hat Yai', 'Chiang Mai', 'Phuket', 'Pattaya'] },
    { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱', cities: ['Dili'] },
    { code: 'TG', name: 'Togo', flag: '🇹🇬', cities: ['Lomé', 'Sokodé', 'Kara'] },
    { code: 'TO', name: 'Tonga', flag: '🇹🇴', cities: ["Nuku'alofa"] },
    { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹', cities: ['Port of Spain', 'San Fernando', 'Chaguanas'] },
    { code: 'TN', name: 'Tunisia', flag: '🇹🇳', cities: ['Tunis', 'Sfax', 'Sousse', 'Ettadhamen', 'Kairouan'] },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷', cities: ['Istanbul', 'Ankara', 'İzmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır'] },
    { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', cities: ['Ashgabat', 'Turkmenbashi', 'Türkmenabat'] },
    { code: 'TV', name: 'Tuvalu', flag: '🇹🇻', cities: ['Funafuti'] },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬', cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara'] },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦', cities: ['Kyiv', 'Kharkiv', 'Odessa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaiv'] },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah'] },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Liverpool', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Belfast', 'Nottingham', 'Newcastle', 'Southampton', 'Oxford', 'Cambridge', 'Brighton', 'Reading'] },
    { code: 'US', name: 'United States', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Nashville', 'Boston', 'Miami', 'Atlanta', 'Portland', 'Las Vegas', 'Minneapolis', 'Detroit', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Sacramento', 'Kansas City', 'Oakland', 'Cleveland', 'Raleigh', 'Colorado Springs', 'New Orleans', 'Tampa', 'Pittsburgh'] },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾', cities: ['Montevideo', 'Salto', 'Ciudad de la Costa'] },
    { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', cities: ['Tashkent', 'Samarkand', 'Namangan', 'Andijan'] },
    { code: 'VU', name: 'Vanuatu', flag: '🇻🇺', cities: ['Port Vila', 'Luganville'] },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪', cities: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay'] },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳', cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Nha Trang', 'Hue'] },
    { code: 'YE', name: 'Yemen', flag: '🇾🇪', cities: ["Sana'a", 'Aden', 'Taiz', 'Al Hudaydah'] },
    { code: 'ZM', name: 'Zambia', flag: '🇿🇲', cities: ['Lusaka', 'Kitwe', 'Ndola', 'Livingstone'] },
    { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', cities: ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare'] },
];

const Register = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        firstName: '',
        lastName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',

        // Step 2: Contact & Location
        email: '',
        city: '',
        country: '',

        // Step 3: Account Setup
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        agreePrivacy: false,
        agreeMarketing: false
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Track which fields have been "touched" (user has interacted with them)
    const [touched, setTouched] = useState({});

    // Generate arrays for date dropdowns
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    // Get cities for the selected country
    const getCountryCities = (countryName) => {
        const country = COUNTRY_DATA.find(c => c.name === countryName);
        return country ? country.cities : [];
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // If country changes, reset city
        if (name === 'country') {
            setFormData(prev => ({
                ...prev,
                country: value,
                city: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Mark field as touched
        setTouched(prev => ({ ...prev, [name]: true }));

        // Clear error when user starts typing/selecting
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
            if (!formData.birthDay) newErrors.birthDay = 'Day is required';
            if (!formData.birthMonth) newErrors.birthMonth = 'Month is required';
            if (!formData.birthYear) newErrors.birthYear = 'Year is required';

            if (formData.birthDay && formData.birthMonth && formData.birthYear) {
                const birthDate = new Date(formData.birthYear, formData.birthMonth - 1, formData.birthDay);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (age < 18 || (age === 18 && monthDiff < 0) ||
                    (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    newErrors.birthYear = 'You must be at least 18 years old';
                }
            }
        }

        if (step === 2) {
            if (!formData.email) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
            if (!formData.country) newErrors.country = 'Country is required';
            // City is optional — no validation required
        }

        if (step === 3) {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'Password must contain uppercase, lowercase, and number';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }

            if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service';
            if (!formData.agreePrivacy) newErrors.agreePrivacy = 'You must agree to the Privacy Policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep(currentStep)) {
            addToast('Please fix the errors before continuing', 'error');
            return;
        }

        // On step 2, check if email is already registered before proceeding
        if (currentStep === 2) {
            setLoading(true);
            try {
                const { data } = await supabase.auth.signUp({
                    email: formData.email,
                    password: 'temp_check_' + Math.random(),
                });
                const identities = data?.user?.identities;
                if (identities !== undefined && identities.length === 0) {
                    setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
                    setLoading(false);
                    return;
                }
                // Free — clean up the temp session
                await supabase.auth.signOut();
            } catch (err) {
                console.warn('Email pre-check failed:', err);
            }
            setLoading(false);
        }

        setCurrentStep(currentStep + 1);
        setTouched({});
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        setTouched({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            addToast('Please fix the errors in the form', 'error');
            return;
        }

        setLoading(true);

        try {
            console.log('=== Registration Started ===');
            console.log('Email:', formData.email);

            const dateOfBirth = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.toString().padStart(2, '0')}`;
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        full_name: fullName,
                        date_of_birth: dateOfBirth,
                        city: formData.city,
                        country: formData.country,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (authError) {
                console.error('❌ Auth error:', authError);
                setErrors({ general: authError.message });
                addToast(authError.message, 'error');
                setLoading(false);
                return;
            }

            // ── Supabase duplicate email detection ──────────────────────────
            // Supabase does NOT return an error for duplicate emails.
            // Instead it returns a fake success where identities is an empty array.
            const identities = authData?.user?.identities;
            if (identities !== undefined && identities.length === 0) {
                console.warn('⚠️ Duplicate email detected via empty identities');
                setErrors({
                    email: 'This email is already registered',
                    emailBanner: 'This email is already taken. Please sign in or use a different email.'
                });
                setCurrentStep(2);
                addToast('This email is already registered', 'error');
                setLoading(false);
                return;
            }

            console.log('✅ Registration successful:', authData);

            if (authData.user) {
                console.log('Creating user profile for ID:', authData.user.id);

                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authData.user.id,
                        email: formData.email,
                        full_name: fullName,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        date_of_birth: dateOfBirth,
                        city: formData.city,
                        country: formData.country,
                        marketing_consent: formData.agreeMarketing,
                        created_at: new Date().toISOString()
                    });

                if (profileError) {
                    console.error('⚠️ Profile creation error:', profileError);
                } else {
                    console.log('✅ User profile created successfully');
                }

                try {
                    await supabase.from('user_finances').insert({
                        user_id: authData.user.id,
                        balance: 0,
                        total_income: 0,
                        total_expenses: 0,
                        created_at: new Date().toISOString()
                    });
                    console.log('✅ User finances initialized');
                } catch (financeError) {
                    console.error('⚠️ Finance init error:', financeError);
                }
            }

            console.log('✅ Registration complete - showing success screen');
            setRegistrationComplete(true);
            addToast('Registration successful! Check your email to verify your account.', 'success');

        } catch (error) {
            console.error('❌ Unexpected error:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
            addToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    // Success Screen
    if (registrationComplete) {
        return (
            <div className="register-page">
                <div className="register-container">
                    <div className="success-screen">
                        <div className="success-icon-large">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h2 className="success-title">Check Your Email! 📧</h2>
                        <p className="success-message">
                            We've sent a verification email to<br />
                            <strong>{formData.email}</strong>
                        </p>
                        <p className="success-instructions">
                            Please click the confirmation link in the email to activate your account.
                            You won't be able to sign in until you verify your email.
                        </p>
                        <p className="success-note">
                            Didn't receive the email? Check your spam folder.
                        </p>
                        <button
                            className="btn-back-to-login"
                            onClick={handleBackToLogin}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const availableCities = getCountryCities(formData.country);

    return (
        <div className="register-page">
            {/* Back Button */}
            <button className="back-button" onClick={handleBackToLogin} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Login
            </button>

            <div className="register-container">
                {/* Header */}
                <div className="register-header">
                    <div className="register-logo-wrapper">
                        <FinScopeAI />
                    </div>
                    <h1 className="register-title">
                        Create Your <span className="ai-gradient">FinScope AI</span> Account
                    </h1>
                    <p className="register-tagline">Start your journey to smarter financial management</p>
                </div>

                {/* Error Message */}
                {(errors.general || errors.emailBanner) && (
                    <div className="error-alert">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{errors.emailBanner || errors.general}</p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div className="progress-steps">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {currentStep > step ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span className="step-label">
                                    {step === 1 && 'Personal'}
                                    {step === 2 && 'Contact'}
                                    {step === 3 && 'Security'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="progress-line">
                        <div
                            className="progress-line-fill"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Form */}
                <form className="register-form" onSubmit={handleSubmit}>
                    {/* STEP 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h2 className="step-title">Personal Information</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        className={errors.firstName ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        className={errors.lastName ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Date of Birth *</label>
                                <div className="date-picker-row">
                                    <select
                                        name="birthDay"
                                        value={formData.birthDay}
                                        onChange={handleChange}
                                        className={`date-select ${errors.birthDay ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Day</option>
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>

                                    <select
                                        name="birthMonth"
                                        value={formData.birthMonth}
                                        onChange={handleChange}
                                        className={`date-select ${errors.birthMonth ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Month</option>
                                        {months.map(month => (
                                            <option key={month.value} value={month.value}>{month.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        name="birthYear"
                                        value={formData.birthYear}
                                        onChange={handleChange}
                                        className={`date-select ${errors.birthYear ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Year</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.birthYear && <span className="error-message">{errors.birthYear}</span>}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Contact & Location */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2 className="step-title">Contact & Location</h2>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={errors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            {/* Country Dropdown */}
                            <div className="form-group">
                                <label htmlFor="country">Country *</label>
                                <div className="country-select-wrapper">
                                    <select
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className={`form-select country-select ${errors.country ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Select your country</option>
                                        {COUNTRY_DATA.map(country => (
                                            <option key={country.code} value={country.name}>
                                                {country.flag} {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.country && <span className="error-message">{errors.country}</span>}
                            </div>

                            {/* City Dropdown - dependent on country */}
                            <div className="form-group">
                                <label htmlFor="city">
                                    City
                                    <span className="label-optional"> (Optional)</span>
                                </label>
                                {formData.country ? (
                                    <>
                                        <select
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="form-select city-select"
                                            disabled={loading}
                                        >
                                            <option value="">Select your city</option>
                                            {availableCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                            <option value="Other">Other (not listed)</option>
                                        </select>
                                        <span className="city-hint">
                                            Can't find your city? Select "Other (not listed)"
                                        </span>
                                    </>
                                ) : (
                                    <div className="city-disabled-hint">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        Please select a country first
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Account Setup & Security */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2 className="step-title">Account Security</h2>

                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Create a strong password"
                                        className={touched.password && errors.password ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {touched.password && errors.password && <span className="error-message">{errors.password}</span>}

                                <div className="password-requirements">
                                    <h4>Password must contain:</h4>
                                    <div className="requirement-list">
                                        <div className={`requirement ${formData.password.length >= 8 ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`requirement ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>One uppercase letter</span>
                                        </div>
                                        <div className={`requirement ${/[a-z]/.test(formData.password) ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>One lowercase letter</span>
                                        </div>
                                        <div className={`requirement ${/\d/.test(formData.password) ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>One number</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Confirm your password"
                                        className={
                                            // Only show error border if: field has been touched AND there's an error
                                            (touched.confirmPassword && errors.confirmPassword) ? 'error' : ''
                                        }
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {/* Only show confirm password error if the field has been touched */}
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <span className="error-message">{errors.confirmPassword}</span>
                                )}
                            </div>

                            <div className="agreements-section">
                                <div className={`checkbox-group ${errors.agreeTerms ? 'error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreeTerms">
                                        I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</Link>
                                    </label>
                                </div>

                                <div className={`checkbox-group ${errors.agreePrivacy ? 'error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="agreePrivacy"
                                        name="agreePrivacy"
                                        checked={formData.agreePrivacy}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreePrivacy">
                                        I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
                                    </label>
                                </div>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreeMarketing"
                                        name="agreeMarketing"
                                        checked={formData.agreeMarketing}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreeMarketing">
                                        I want to receive updates and tips (Optional)
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                className="btn-previous"
                                onClick={handlePrevious}
                                disabled={loading}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                        )}

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                className="btn-next"
                                onClick={handleNext}
                                disabled={loading}
                            >
                                Next
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Login Link */}
                    <p className="login-link">
                        Already have an account? <button type="button" onClick={handleBackToLogin} disabled={loading}>Sign in</button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;