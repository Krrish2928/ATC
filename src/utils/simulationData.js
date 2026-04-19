// simulationData.js - Contains dense population config for ATC simulation

export const AIRPORTS = [
  // ** North America (USA 5-8+, Canada, Mexico) **
  { id: 'JFK', name: 'New York JFK', city: 'New York', country: 'USA', coords: [-73.78, 40.64], runways: 4, region: 'NA' },
  { id: 'LAX', name: 'Los Angeles Int.', city: 'Los Angeles', country: 'USA', coords: [-118.41, 33.94], runways: 4, region: 'NA' },
  { id: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'USA', coords: [-87.90, 41.97], runways: 8, region: 'NA' },
  { id: 'DFW', name: 'Dallas/Fort Worth', city: 'Dallas', country: 'USA', coords: [-97.04, 32.89], runways: 7, region: 'NA' },
  { id: 'ATL', name: 'Atlanta Hartsfield', city: 'Atlanta', country: 'USA', coords: [-84.42, 33.64], runways: 5, region: 'NA' },
  { id: 'MIA', name: 'Miami Int.', city: 'Miami', country: 'USA', coords: [-80.28, 25.79], runways: 4, region: 'NA' },
  { id: 'SFO', name: 'San Francisco Int.', city: 'San Francisco', country: 'USA', coords: [-122.37, 37.61], runways: 4, region: 'NA' },
  { id: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', country: 'USA', coords: [-122.30, 47.45], runways: 3, region: 'NA' },
  { id: 'BOS', name: 'Boston Logan', city: 'Boston', country: 'USA', coords: [-71.01, 42.36], runways: 6, region: 'NA' },
  { id: 'DEN', name: 'Denver Int.', city: 'Denver', country: 'USA', coords: [-104.67, 39.85], runways: 6, region: 'NA' },
  { id: 'LAS', name: 'Harry Reid Int.', city: 'Las Vegas', country: 'USA', coords: [-115.15, 36.08], runways: 4, region: 'NA' },
  { id: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', country: 'USA', coords: [-112.00, 33.43], runways: 3, region: 'NA' },
  { id: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', coords: [-95.33, 29.99], runways: 5, region: 'NA' },
  { id: 'MSP', name: 'Minneapolis-Saint Paul', city: 'Minneapolis', country: 'USA', coords: [-93.22, 44.88], runways: 4, region: 'NA' },
  { id: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA', coords: [-83.35, 42.21], runways: 6, region: 'NA' },
  { id: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', coords: [-79.62, 43.67], runways: 5, region: 'NA' },
  { id: 'YVR', name: 'Vancouver Int.', city: 'Vancouver', country: 'Canada', coords: [-123.18, 49.19], runways: 3, region: 'NA' },
  { id: 'MEX', name: 'Mexico City Int.', city: 'Mexico City', country: 'Mexico', coords: [-99.07, 19.43], runways: 2, region: 'NA' },
  // ** South Asia / India (15 as requested + neighbors) **
  { id: 'BOM', name: 'Mumbai Chhatrapati', city: 'Mumbai', country: 'India', coords: [72.86, 19.08], runways: 2, region: 'SA' },
  { id: 'DEL', name: 'Delhi Indira Gandhi', city: 'Delhi', country: 'India', coords: [77.10, 28.55], runways: 4, region: 'SA' },
  { id: 'BLR', name: 'Bangalore Kempegowda', city: 'Bangalore', country: 'India', coords: [77.70, 13.19], runways: 2, region: 'SA' },
  { id: 'MAA', name: 'Chennai Int.', city: 'Chennai', country: 'India', coords: [80.17, 12.99], runways: 2, region: 'SA' },
  { id: 'HYD', name: 'Rajiv Gandhi Int.', city: 'Hyderabad', country: 'India', coords: [78.43, 17.24], runways: 2, region: 'SA' },
  { id: 'CCU', name: 'Netaji Subhas Chandra', city: 'Kolkata', country: 'India', coords: [88.44, 22.65], runways: 2, region: 'SA' },
  { id: 'AMD', name: 'Sardar Vallabhbhai Patel', city: 'Ahmedabad', country: 'India', coords: [72.63, 23.07], runways: 1, region: 'SA' },
  { id: 'PNQ', name: 'Pune Int.', city: 'Pune', country: 'India', coords: [73.91, 18.58], runways: 1, region: 'SA' },
  { id: 'JAI', name: 'Jaipur Int.', city: 'Jaipur', country: 'India', coords: [75.81, 26.83], runways: 1, region: 'SA' },
  { id: 'GOI', name: 'Dabolim Airport', city: 'Goa', country: 'India', coords: [73.83, 15.38], runways: 1, region: 'SA' },
  { id: 'COK', name: 'Cochin Int.', city: 'Kochi', country: 'India', coords: [76.39, 10.15], runways: 1, region: 'SA' },
  { id: 'LKO', name: 'Chaudhary Charan Singh', city: 'Lucknow', country: 'India', coords: [80.88, 26.76], runways: 1, region: 'SA' },
  { id: 'ATQ', name: 'Sri Guru Ram Dass', city: 'Amritsar', country: 'India', coords: [74.79, 31.70], runways: 1, region: 'SA' },
  { id: 'SXR', name: 'Sheikh ul-Alam Int.', city: 'Srinagar', country: 'India', coords: [74.77, 33.99], runways: 1, region: 'SA' },
  { id: 'BDQ', name: 'Vadodara Airport', city: 'Vadodara', country: 'India', coords: [73.22, 22.33], runways: 1, region: 'SA' },
  { id: 'KTM', name: 'Tribhuvan Int.', city: 'Kathmandu', country: 'Nepal', coords: [85.35, 27.69], runways: 1, region: 'SA' },
  { id: 'CMB', name: 'Bandaranaike Int.', city: 'Colombo', country: 'Sri Lanka', coords: [79.88, 7.18], runways: 1, region: 'SA' },
  { id: 'DAC', name: 'Hazrat Shahjalal Int.', city: 'Dhaka', country: 'Bangladesh', coords: [90.39, 23.84], runways: 1, region: 'SA' },
  { id: 'ISB', name: 'Islamabad Int.', city: 'Islamabad', country: 'Pakistan', coords: [72.82, 33.54], runways: 2, region: 'SA' },
  // ** Europe (UK, France, Germany 5-8+ etc) **
  { id: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', coords: [-0.45, 51.47], runways: 2, region: 'EU' },
  { id: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK', coords: [-0.19, 51.15], runways: 1, region: 'EU' },
  { id: 'MAN', name: 'Manchester', city: 'Manchester', country: 'UK', coords: [-2.27, 53.35], runways: 2, region: 'EU' },
  { id: 'EDI', name: 'Edinburgh', city: 'Edinburgh', country: 'UK', coords: [-3.36, 55.95], runways: 2, region: 'EU' },
  { id: 'BHX', name: 'Birmingham', city: 'Birmingham', country: 'UK', coords: [-1.74, 52.45], runways: 1, region: 'EU' },
  { id: 'GLA', name: 'Glasgow Int.', city: 'Glasgow', country: 'UK', coords: [-4.43, 55.87], runways: 1, region: 'EU' },
  { id: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', coords: [2.54, 49.00], runways: 4, region: 'EU' },
  { id: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', coords: [2.36, 48.72], runways: 3, region: 'EU' },
  { id: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France', coords: [7.21, 43.66], runways: 2, region: 'EU' },
  { id: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France', coords: [5.08, 45.72], runways: 2, region: 'EU' },
  { id: 'MRS', name: 'Marseille Provence', city: 'Marseille', country: 'France', coords: [5.21, 43.43], runways: 2, region: 'EU' },
  { id: 'FRA', name: 'Frankfurt Int.', city: 'Frankfurt', country: 'Germany', coords: [8.57, 50.03], runways: 4, region: 'EU' },
  { id: 'MUC', name: 'Munich Int.', city: 'Munich', country: 'Germany', coords: [11.78, 48.35], runways: 2, region: 'EU' },
  { id: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany', coords: [13.50, 52.36], runways: 2, region: 'EU' },
  { id: 'DUS', name: 'Düsseldorf', city: 'Dusseldorf', country: 'Germany', coords: [6.76, 51.28], runways: 2, region: 'EU' },
  { id: 'HAM', name: 'Hamburg', city: 'Hamburg', country: 'Germany', coords: [9.98, 53.63], runways: 2, region: 'EU' },
  { id: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', coords: [4.76, 52.30], runways: 6, region: 'EU' },
  { id: 'MAD', name: 'Madrid Barajas', city: 'Madrid', country: 'Spain', coords: [-3.57, 40.48], runways: 4, region: 'EU' },
  { id: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', coords: [2.07, 41.29], runways: 3, region: 'EU' },
  { id: 'AGP', name: 'Málaga Costa', city: 'Malaga', country: 'Spain', coords: [-4.49, 36.67], runways: 2, region: 'EU' },
  { id: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain', coords: [2.73, 39.55], runways: 2, region: 'EU' },
  { id: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy', coords: [12.23, 41.80], runways: 3, region: 'EU' },
  { id: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy', coords: [8.72, 45.63], runways: 2, region: 'EU' },
  { id: 'VCE', name: 'Venice Marco Polo', city: 'Venice', country: 'Italy', coords: [12.35, 45.50], runways: 1, region: 'EU' },
  { id: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', coords: [8.55, 47.45], runways: 3, region: 'EU' },
  { id: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', coords: [6.10, 46.23], runways: 1, region: 'EU' },
  { id: 'VIE', name: 'Vienna Int.', city: 'Vienna', country: 'Austria', coords: [16.56, 48.11], runways: 2, region: 'EU' },
  { id: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', coords: [4.48, 50.90], runways: 3, region: 'EU' },
  { id: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', coords: [12.65, 55.61], runways: 3, region: 'EU' },
  { id: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', coords: [11.10, 60.19], runways: 2, region: 'EU' },
  { id: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', coords: [17.91, 59.65], runways: 3, region: 'EU' },
  { id: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', coords: [24.96, 60.31], runways: 3, region: 'EU' },
  { id: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland', coords: [20.96, 52.16], runways: 2, region: 'EU' },
  { id: 'PRG', name: 'Prague Václav Havel', city: 'Prague', country: 'Czech', coords: [14.26, 50.10], runways: 2, region: 'EU' },
  { id: 'LIS', name: 'Lisbon Portela', city: 'Lisbon', country: 'Portugal', coords: [-9.13, 38.77], runways: 2, region: 'EU' },
  { id: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', coords: [-6.27, 53.42], runways: 2, region: 'EU' },
  { id: 'ATH', name: 'Athens Eleftherios', city: 'Athens', country: 'Greece', coords: [23.94, 37.93], runways: 2, region: 'EU' },
  // ** Middle East **
  { id: 'DXB', name: 'Dubai Int.', city: 'Dubai', country: 'UAE', coords: [55.36, 25.25], runways: 2, region: 'ME' },
  { id: 'AUH', name: 'Abu Dhabi Int.', city: 'Abu Dhabi', country: 'UAE', coords: [54.65, 24.43], runways: 2, region: 'ME' },
  { id: 'SHJ', name: 'Sharjah Int.', city: 'Sharjah', country: 'UAE', coords: [55.51, 25.32], runways: 1, region: 'ME' },
  { id: 'DWC', name: 'Al Maktoum Int.', city: 'Dubai', country: 'UAE', coords: [55.17, 24.90], runways: 2, region: 'ME' },
  { id: 'DOH', name: 'Doha Hamad Int.', city: 'Doha', country: 'Qatar', coords: [51.60, 25.27], runways: 2, region: 'ME' },
  { id: 'RUH', name: 'Riyadh King Khalid', city: 'Riyadh', country: 'Saudi Arabia', coords: [46.70, 24.95], runways: 4, region: 'ME' },
  { id: 'JED', name: 'Jeddah King Abdulaziz', city: 'Jeddah', country: 'Saudi Arabia', coords: [39.15, 21.67], runways: 3, region: 'ME' },
  { id: 'DMM', name: 'Dammam King Fahd', city: 'Dammam', country: 'Saudi Arabia', coords: [49.79, 26.47], runways: 2, region: 'ME' },
  { id: 'KWI', name: 'Kuwait Int.', city: 'Kuwait City', country: 'Kuwait', coords: [47.96, 25.23], runways: 2, region: 'ME' },
  { id: 'MCT', name: 'Muscat Int.', city: 'Muscat', country: 'Oman', coords: [58.28, 23.59], runways: 1, region: 'ME' },
  { id: 'BAH', name: 'Bahrain Int.', city: 'Manama', country: 'Bahrain', coords: [50.63, 26.27], runways: 2, region: 'ME' },
  { id: 'AMM', name: 'Queen Alia Int.', city: 'Amman', country: 'Jordan', coords: [35.98, 31.72], runways: 2, region: 'ME' },
  { id: 'BEY', name: 'Beirut-Rafic Hariri', city: 'Beirut', country: 'Lebanon', coords: [35.48, 33.82], runways: 2, region: 'ME' },
  { id: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', coords: [28.73, 41.28], runways: 5, region: 'ME' },
  { id: 'SAW', name: 'Sabiha Gökçen', city: 'Istanbul', country: 'Turkey', coords: [29.31, 40.90], runways: 1, region: 'ME' },
  // ** Asia Pacific (China, Aus, Japan, SEA) **
  { id: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', coords: [139.77, 35.54], runways: 4, region: 'AP' },
  { id: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', coords: [140.39, 35.77], runways: 2, region: 'AP' },
  { id: 'KIX', name: 'Kansai Int.', city: 'Osaka', country: 'Japan', coords: [135.24, 34.43], runways: 2, region: 'AP' },
  { id: 'PEK', name: 'Beijing Capital', city: 'Beijing', country: 'China', coords: [116.40, 40.07], runways: 3, region: 'AP' },
  { id: 'PKX', name: 'Beijing Daxing', city: 'Beijing', country: 'China', coords: [116.41, 39.50], runways: 4, region: 'AP' },
  { id: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China', coords: [121.80, 31.14], runways: 4, region: 'AP' },
  { id: 'SHA', name: 'Shanghai Hongqiao', city: 'Shanghai', country: 'China', coords: [121.33, 31.19], runways: 2, region: 'AP' },
  { id: 'CAN', name: 'Guangzhou Baiyun', city: 'Guangzhou', country: 'China', coords: [113.29, 28.39], runways: 3, region: 'AP' },
  { id: 'CTU', name: 'Chengdu Shuangliu', city: 'Chengdu', country: 'China', coords: [103.94, 30.57], runways: 2, region: 'AP' },
  { id: 'HKG', name: 'Hong Kong Int.', city: 'Hong Kong', country: 'China', coords: [113.91, 22.30], runways: 2, region: 'AP' },
  { id: 'TPE', name: 'Taiwan Taoyuan', city: 'Taipei', country: 'Taiwan', coords: [121.23, 25.07], runways: 2, region: 'AP' },
  { id: 'ICN', name: 'Seoul Incheon', city: 'Seoul', country: 'South Korea', coords: [126.45, 37.46], runways: 3, region: 'AP' },
  { id: 'GMP', name: 'Gimpo Int.', city: 'Seoul', country: 'South Korea', coords: [126.79, 37.55], runways: 2, region: 'AP' },
  { id: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', coords: [103.99, 1.36], runways: 3, region: 'AP' },
  { id: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', coords: [100.75, 13.68], runways: 2, region: 'AP' },
  { id: 'DMK', name: 'Don Mueang Int.', city: 'Bangkok', country: 'Thailand', coords: [100.60, 13.91], runways: 2, region: 'AP' },
  { id: 'KUL', name: 'Kuala Lumpur Int.', city: 'Kuala Lumpur', country: 'Malaysia', coords: [101.70, 2.74], runways: 3, region: 'AP' },
  { id: 'CGK', name: 'Jakarta Soekarno', city: 'Jakarta', country: 'Indonesia', coords: [106.65, -6.12], runways: 3, region: 'AP' },
  { id: 'DPS', name: 'Ngurah Rai Int.', city: 'Bali', country: 'Indonesia', coords: [115.16, -8.74], runways: 1, region: 'AP' },
  { id: 'MNL', name: 'Manila Ninoy Aquino', city: 'Manila', country: 'Philippines', coords: [121.01, 14.50], runways: 2, region: 'AP' },
  { id: 'SGN', name: 'Tan Son Nhat', city: 'Ho Chi Minh', country: 'Vietnam', coords: [106.66, 10.81], runways: 2, region: 'AP' },
  { id: 'SYD', name: 'Sydney Kingsford', city: 'Sydney', country: 'Australia', coords: [151.17, -33.93], runways: 3, region: 'AP' },
  { id: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia', coords: [144.84, -37.67], runways: 2, region: 'AP' },
  { id: 'BNE', name: 'Brisbane', city: 'Brisbane', country: 'Australia', coords: [153.11, -27.38], runways: 2, region: 'AP' },
  { id: 'PER', name: 'Perth', city: 'Perth', country: 'Australia', coords: [115.96, -31.94], runways: 2, region: 'AP' },
  { id: 'ADL', name: 'Adelaide', city: 'Adelaide', country: 'Australia', coords: [138.53, -34.94], runways: 2, region: 'AP' },
  { id: 'AKL', name: 'Auckland', city: 'Auckland', country: 'New Zealand', coords: [174.79, -37.00], runways: 2, region: 'AP' },
  // ** Africa **
  { id: 'CAI', name: 'Cairo Int.', city: 'Cairo', country: 'Egypt', coords: [31.40, 30.12], runways: 3, region: 'AF' },
  { id: 'HRG', name: 'Hurghada Int.', city: 'Hurghada', country: 'Egypt', coords: [33.79, 27.17], runways: 1, region: 'AF' },
  { id: 'JNB', name: 'O.R. Tambo Int.', city: 'Johannesburg', country: 'South Africa', coords: [28.24, -26.13], runways: 2, region: 'AF' },
  { id: 'CPT', name: 'Cape Town Int.', city: 'Cape Town', country: 'South Africa', coords: [18.60, -33.96], runways: 2, region: 'AF' },
  { id: 'DUR', name: 'King Shaka Int.', city: 'Durban', country: 'South Africa', coords: [31.11, -29.61], runways: 1, region: 'AF' },
  { id: 'LOS', name: 'Murtala Muhammed', city: 'Lagos', country: 'Nigeria', coords: [3.32, 6.57], runways: 2, region: 'AF' },
  { id: 'ABV', name: 'Nnamdi Azikiwe', city: 'Abuja', country: 'Nigeria', coords: [7.26, 9.00], runways: 1, region: 'AF' },
  { id: 'NBO', name: 'Jomo Kenyatta', city: 'Nairobi', country: 'Kenya', coords: [36.92, -1.31], runways: 1, region: 'AF' },
  { id: 'ADD', name: 'Addis Ababa Bole', city: 'Addis Ababa', country: 'Ethiopia', coords: [38.79, 8.97], runways: 2, region: 'AF' },
  { id: 'CAS', name: 'Mohammed V Int.', city: 'Casablanca', country: 'Morocco', coords: [-7.58, 33.36], runways: 2, region: 'AF' },
  { id: 'RAK', name: 'Marrakesh Menara', city: 'Marrakech', country: 'Morocco', coords: [-8.03, 31.60], runways: 1, region: 'AF' },
  // ** South America **
  { id: 'GRU', name: 'São Paulo-Guarulhos', city: 'Sao Paulo', country: 'Brazil', coords: [-46.47, -23.43], runways: 2, region: 'SAM' },
  { id: 'GIG', name: 'Rio de Janeiro-Galeão', city: 'Rio de Janeiro', country: 'Brazil', coords: [-43.25, -22.81], runways: 2, region: 'SAM' },
  { id: 'BSB', name: 'Brasília Int.', city: 'Brasilia', country: 'Brazil', coords: [-47.91, -15.87], runways: 2, region: 'SAM' },
  { id: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina', coords: [-58.53, -34.82], runways: 2, region: 'SAM' },
  { id: 'AEP', name: 'Jorge Newbery', city: 'Buenos Aires', country: 'Argentina', coords: [-58.41, -34.55], runways: 1, region: 'SAM' },
  { id: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile', coords: [-70.79, -33.39], runways: 2, region: 'SAM' },
  { id: 'LIM', name: 'Jorge Chávez Int.', city: 'Lima', country: 'Peru', coords: [-77.11, -12.02], runways: 1, region: 'SAM' },
  { id: 'BOG', name: 'El Dorado Int.', city: 'Bogota', country: 'Colombia', coords: [-74.14, 4.70], runways: 2, region: 'SAM' },
  // ** Russia / Additives **
  { id: 'SVO', name: 'Sheremetyevo Int.', city: 'Moscow', country: 'Russia', coords: [37.41, 55.97], runways: 3, region: 'EU' },
  { id: 'DME', name: 'Domodedovo Int.', city: 'Moscow', country: 'Russia', coords: [37.90, 55.40], runways: 2, region: 'EU' },
  { id: 'LED', name: 'Pulkovo', city: 'St. Petersburg', country: 'Russia', coords: [30.26, 59.80], runways: 2, region: 'EU' },
];

const AIRLINES = ['Air India', 'British Airways', 'Emirates', 'United', 'Delta', 'Lufthansa', 'Singapore Airlines', 'Qatar Airways', 'Turkish Airlines', 'Air France', 'Etihad', 'IndiGo', 'SpiceJet', 'American Airlines', 'Qantas'];
const AIRLINE_CODES = {
  'Air India': 'AI', 'British Airways': 'BA', 'Emirates': 'EK', 'United': 'UA', 'Delta': 'DL', 
  'Lufthansa': 'LH', 'Singapore Airlines': 'SQ', 'Qatar Airways': 'QR', 'Turkish Airlines': 'TK', 
  'Air France': 'AF', 'Etihad': 'EY', 'IndiGo': '6E', 'SpiceJet': 'SG', 'American Airlines': 'AA', 'Qantas': 'QF'
};

const DISTRIBUTION = {
  'NA': 30,
  'EU': 35,
  'AP': 35,
  'ME': 15,
  'SA': 15,
  'AF': 10,
  'SAM': 10
};

// Precisely defined counts per requirements
let countEmg = 8;
let countFuel = 12;
let countNormal = 130;

export const INITIAL_FLIGHTS = [];
let flightIdCounter = 1;

Object.entries(DISTRIBUTION).forEach(([region, targetCount]) => {
  const regionAirports = AIRPORTS.filter(a => a.region === region);
  const otherAirports = AIRPORTS.filter(a => a.region !== region);

  for (let i = 0; i < targetCount; i++) {
    // Attempt assigning statuses
    let status = 'normal';
    if (countEmg > 0) { status = 'emergency'; countEmg--; }
    else if (countFuel > 0) { status = 'low-fuel'; countFuel--; }
    else { countNormal--; }

    const origin = regionAirports[Math.floor(Math.random() * regionAirports.length)] || AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    const dest = otherAirports[Math.floor(Math.random() * otherAirports.length)] || AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];

    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    const flightNumber = `${AIRLINE_CODES[airline]}-${100 + Math.floor(Math.random() * 899)}`;

    const startLat = origin.coords[1];
    const startLng = origin.coords[0];
    
    // Clamp to valid Mapbox/Web Mercator bounds
    // Lat: -85 to 85, Lng: -180 to 180
    const flightLat = Math.max(-85, Math.min(85, startLat + (Math.random() * 2 - 1)));
    const flightLng = Math.max(-175, Math.min(175, startLng + (Math.random() * 2 - 1)));

    INITIAL_FLIGHTS.push({
      id: flightIdCounter++,
      flightNumber,
      airline,
      origin: origin.id,
      destination: dest.id,
      lat: flightLat,
      lng: flightLng,
      altitude: 30000 + Math.floor(Math.random() * 10000),
      speed: 400 + Math.floor(Math.random() * 100),
      heading: Math.floor(Math.random() * 360),
      fuel: status === 'emergency' ? 8 : (status === 'low-fuel' ? 14 : 40 + Math.floor(Math.random() * 55)),
      status,
      history: []
    });
  }
});

// Since the counts were assigned orderly, shuffle the array so emergencies aren't all clustered NA!
INITIAL_FLIGHTS.sort(() => Math.random() - 0.5);
