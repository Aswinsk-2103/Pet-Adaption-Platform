const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Seed Data
let users = [
  {
    _id: 'user-1',
    name: 'Jane Doe',
    email: 'user@petnest.com',
    password: 'user123',
    role: 'user',
    favorites: ['pet-1', 'pet-3'],
    lifestyle: {
      activityLevel: 'moderate',
      homeType: 'house',
      hasChildren: true,
      hasOtherPets: true,
      experience: 'intermediate'
    }
  },
  {
    _id: 'admin-1',
    name: 'Shelter Admin',
    email: 'admin@petnest.com',
    password: 'admin123',
    role: 'admin',
    favorites: [],
    lifestyle: {}
  }
];

let pets = [
  {
    _id: 'pet-1',
    name: 'Bella',
    breed: 'Golden Retriever',
    age: 2,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80'
    ],
    traits: ['Friendly', 'Playful', 'Energetic'],
    status: 'available',
    activityLevel: 'high',
    goodWithKids: true,
    goodWithPets: true,
    description: 'Bella is an adorable, high-energy Golden Retriever who loves running in park outdoor trails and playing fetch with kids.'
  },
  {
    _id: 'pet-2',
    name: 'Milo',
    breed: 'French Bulldog',
    age: 1,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80'
    ],
    traits: ['Calm', 'Affectionate', 'Gentle'],
    status: 'available',
    activityLevel: 'low',
    goodWithKids: true,
    goodWithPets: false,
    description: 'Milo is a cozy couch companion who loves belly rubs, quiet naps, and relaxed indoor walks.'
  },
  {
    _id: 'pet-3',
    name: 'Luna',
    breed: 'Siamese Cat',
    age: 3,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
    ],
    traits: ['Curious', 'Intelligent', 'Vocal'],
    status: 'available',
    activityLevel: 'moderate',
    goodWithKids: true,
    goodWithPets: true,
    description: 'Luna is a graceful Siamese cat with striking blue eyes who loves perching by sunny windows and playing with feather toys.'
  },
  {
    _id: 'pet-4',
    name: 'Rocky',
    breed: 'German Shepherd',
    age: 4,
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80'
    ],
    traits: ['Loyal', 'Protective', 'Smart'],
    status: 'adopted',
    activityLevel: 'high',
    goodWithKids: true,
    goodWithPets: true,
    description: 'Rocky is a brave and loyal German Shepherd who excels in agility training and protecting his home family.'
  },
  {
    _id: 'pet-5',
    name: 'Coco',
    breed: 'Poodle',
    age: 2,
    image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80'
    ],
    traits: ['Smart', 'Friendly', 'Hypoallergenic'],
    status: 'available',
    activityLevel: 'moderate',
    goodWithKids: true,
    goodWithPets: true,
    description: 'Coco is a smart, hypoallergenic Poodle who enjoys learning new tricks and socializing with everyone.'
  }
];

let applications = [
  {
    _id: 'app-1',
    userId: { _id: 'user-1', name: 'Jane Doe', email: 'user@petnest.com' },
    petId: pets[3], // Rocky
    reason: 'I have a large backyard and experience with working breeds.',
    livingArrangement: 'House with fenced yard',
    experience: 'intermediate',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    _id: 'app-2',
    userId: { _id: 'user-1', name: 'Jane Doe', email: 'user@petnest.com' },
    petId: pets[0], // Bella
    reason: 'We want a fun family dog for weekend hiking trips.',
    livingArrangement: 'House with yard',
    experience: 'intermediate',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

// Helper to parse JSON body
function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Helper to decode token or get logged in user
function getUserFromReq(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return users[0];
  const token = authHeader.replace('Bearer ', '');
  const user = users.find((u) => u._id === token || u.email === token);
  return user || users[0];
}

const buildDir = path.join(__dirname, 'client', 'build');

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const method = req.method;

  const jsonResponse = (data, code = 200) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const errorResponse = (msg, code = 400) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
  };

  try {
    // ── AUTH ENDPOINTS ──
    if (method === 'POST' && pathName === '/auth/login') {
      const body = await getBody(req);
      const user = users.find((u) => u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (!user || user.password !== body.password) {
        return errorResponse('Invalid email or password', 401);
      }
      return jsonResponse({
        token: user._id,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    if (method === 'POST' && pathName === '/auth/signup') {
      const body = await getBody(req);
      if (!body.name || !body.email || !body.password) {
        return errorResponse('All fields are required');
      }
      const existing = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
      if (existing) {
        return errorResponse('User already exists with this email');
      }
      const newUser = {
        _id: 'user-' + (users.length + 1),
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role || 'user',
        favorites: [],
        lifestyle: {}
      };
      users.push(newUser);
      return jsonResponse({
        token: newUser._id,
        user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }

    // ── USER PROFILE & FAVORITES ──
    if (method === 'GET' && pathName === '/users/me') {
      const currentUser = getUserFromReq(req);
      const favPets = pets.filter((p) => currentUser.favorites.includes(p._id));
      return jsonResponse({
        ...currentUser,
        favorites: favPets
      });
    }

    if (method === 'PUT' && pathName === '/users/lifestyle') {
      const currentUser = getUserFromReq(req);
      const body = await getBody(req);
      currentUser.lifestyle = body;
      return jsonResponse({ message: 'Lifestyle updated', lifestyle: currentUser.lifestyle });
    }

    if (method === 'POST' && pathName.startsWith('/users/favorites/')) {
      const petId = pathName.split('/users/favorites/')[1];
      const currentUser = getUserFromReq(req);
      const idx = currentUser.favorites.indexOf(petId);
      if (idx > -1) {
        currentUser.favorites.splice(idx, 1);
      } else {
        currentUser.favorites.push(petId);
      }
      const favPets = pets.filter((p) => currentUser.favorites.includes(p._id));
      return jsonResponse({ favorites: currentUser.favorites, favoritePets: favPets });
    }

    // ── PETS ENDPOINTS ──
    if (method === 'GET' && pathName === '/pets') {
      const breedQuery = parsedUrl.query.breed;
      let result = pets;
      if (breedQuery) {
        result = result.filter((p) => p.breed.toLowerCase().includes(breedQuery.toLowerCase()));
      }
      return jsonResponse(result);
    }

    if (method === 'GET' && pathName.startsWith('/pets/')) {
      const petId = pathName.split('/pets/')[1];
      const pet = pets.find((p) => p._id === petId);
      if (!pet) return errorResponse('Pet not found', 404);
      return jsonResponse(pet);
    }

    if (method === 'POST' && pathName === '/pets') {
      const body = await getBody(req);
      const newPet = {
        _id: 'pet-' + (pets.length + 1) + '-' + Date.now(),
        name: body.name,
        breed: body.breed,
        age: Number(body.age),
        image: body.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
        gallery: body.image ? [body.image] : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'],
        traits: body.traits || [],
        status: body.status || 'available',
        activityLevel: body.activityLevel || 'moderate',
        goodWithKids: body.goodWithKids ?? true,
        goodWithPets: body.goodWithPets ?? true,
        description: body.description || ''
      };
      pets.push(newPet);
      return jsonResponse(newPet, 201);
    }

    if (method === 'PUT' && pathName.startsWith('/pets/')) {
      const petId = pathName.split('/pets/')[1];
      const petIndex = pets.findIndex((p) => p._id === petId);
      if (petIndex === -1) return errorResponse('Pet not found', 404);

      const body = await getBody(req);
      pets[petIndex] = {
        ...pets[petIndex],
        ...body,
        _id: petId
      };
      return jsonResponse(pets[petIndex]);
    }

    if (method === 'DELETE' && pathName.startsWith('/pets/')) {
      const petId = pathName.split('/pets/')[1];
      pets = pets.filter((p) => p._id !== petId);
      return jsonResponse({ message: 'Pet deleted' });
    }

    // ── APPLICATIONS ENDPOINTS ──
    if (method === 'GET' && pathName === '/applications') {
      return jsonResponse(applications);
    }

    if (method === 'GET' && pathName === '/applications/mine') {
      const currentUser = getUserFromReq(req);
      const userApps = applications.filter(
        (a) => a.userId?._id === currentUser._id || a.userName === currentUser.name
      );
      return jsonResponse(userApps);
    }

    if (method === 'POST' && pathName === '/applications') {
      const currentUser = getUserFromReq(req);
      const body = await getBody(req);

      let petObj = pets.find((p) => p._id === body.petId);
      if (!petObj && typeof body.petId === 'object') petObj = body.petId;

      const newApp = {
        _id: 'app-' + (applications.length + 1) + '-' + Date.now(),
        userId: { _id: currentUser._id, name: currentUser.name, email: currentUser.email },
        userName: currentUser.name,
        petId: petObj || { _id: body.petId, name: 'Unknown Pet', breed: 'Unknown Breed' },
        reason: body.reason || '',
        livingArrangement: body.livingArrangement || '',
        experience: body.experience || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      applications.push(newApp);
      return jsonResponse(newApp, 201);
    }

    if (method === 'PUT' && pathName.startsWith('/applications/')) {
      const appId = pathName.split('/applications/')[1];
      const app = applications.find((a) => a._id === appId);
      if (!app) return errorResponse('Application not found', 404);

      const body = await getBody(req);
      if (body.status) app.status = body.status;

      if (app.status === 'approved' && app.petId?._id) {
        const targetPet = pets.find((p) => p._id === app.petId._id);
        if (targetPet) targetPet.status = 'adopted';
      }

      return jsonResponse(app);
    }

    // ── ADMIN STATS ──
    if (method === 'GET' && pathName === '/admin/stats') {
      const totalPets = pets.length;
      const adoptedPets = pets.filter((p) => p.status === 'adopted').length;
      const totalApplications = applications.length;
      const approvedApplications = applications.filter((a) => a.status === 'approved').length;
      const pendingApplications = applications.filter((a) => a.status === 'pending').length;
      const successRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;

      return jsonResponse({
        totalPets,
        adoptedPets,
        totalApplications,
        approvedApplications,
        pendingApplications,
        successRate
      });
    }

    // ── STATIC FILE SERVING FOR FRONTEND BUILD ──
    if (fs.existsSync(buildDir)) {
      let filePath = path.join(buildDir, pathName === '/' ? 'index.html' : pathName);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(buildDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          errorResponse('File not found', 404);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
      return;
    }

    errorResponse('Not found', 404);
  } catch (err) {
    console.error('Server error:', err);
    errorResponse('Internal server error', 500);
  }
});

server.listen(PORT, () => {
  console.log(`🐾 PetNest Server running on port ${PORT}`);
});
