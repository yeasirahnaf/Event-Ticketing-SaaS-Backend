const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'Saas',
});

const themeData = {
    name: 'Visionary Expo',
    description: 'A modern, minimal, and white-space focused theme designed for high-end exhibitions, art shows, and trade expos.',
    category: 'Exhibition',
    isPremium: true,
    price: 59.99,
    status: 'active',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531050171651-a3a49696bb4d?auto=format&fit=crop&q=80&w=800',
    defaultProperties: {
        colors: {
            primary: '#10B981', // Emerald 500
            secondary: '#0F172A', // Navy 900
            background: '#FFFFFF', // Pure White
            text: '#1E293B', // Slate 800
            accent: '#F1F5F9' // Slate 100
        },
        fonts: {
            heading: 'Outfit, sans-serif',
            body: 'Inter, sans-serif'
        },
        layout: 'minimal'
    },
    templateStructure: {
        sections: {
            hero: { enabled: true, order: 1, style: 'minimal' },
            about: { enabled: true, order: 2, style: 'split' },
            features: { enabled: true, order: 3, style: 'clean' },
            gallery: { enabled: true, order: 4, style: 'dynamic' },
            schedule: { enabled: true, order: 5, style: 'simple' },
            tickets: { enabled: true, order: 6, style: 'minimalist' },
            speakers: { enabled: true, order: 7, style: 'modern' },
            venue: { enabled: true, order: 8, style: 'immersive' },
            faq: { enabled: true, order: 9, style: 'clean' }
        }
    },
    defaultContent: {
        hero: {
            title: 'Visionary Expo 2026: The Intersection of Art & Tech',
            subtitle: 'Experience the future of human creativity in a curated space designed for inspiration.',
            backgroundImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000',
            ctaText: 'Reserve Your Entry'
        },
        about: {
            heading: 'A New Perspective on Exhibitions',
            content: 'The Visionary Expo brings together world-renowned artists and tech pioneers. Our mission is to provide a clean, focused environment where ideas can breathe and visitors can truly immerse themselves in innovation.',
            images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000']
        },
        features: [
            { icon: 'Zap', title: 'Immersive Displays', description: 'State-of-the-art sensory installations that redefine the gallery experience.' },
            { icon: 'Shield', title: 'Curated Selection', description: 'Every exhibit is hand-picked by our international board of experts.' },
            { icon: 'Award', title: 'Interactive Panels', description: 'Engage with the creators through our integrated touch-points.' }
        ],
        gallery: [
            'https://images.unsplash.com/photo-1531050171651-a3a49696bb4d?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1459749411177-042180ce6742?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=1000'
        ],
        schedule: [
            { time: '10:00 AM', title: 'Doors Open', description: 'Morning guided tour for early-bird pass holders.' },
            { time: '01:00 PM', title: 'Artist Talk', description: 'Exploring the digital-physical divide.' },
            { time: '04:00 PM', title: 'Tech Showcase', description: 'Live demonstration of holographic rendering.' }
        ],
        tickets: [
            { name: 'Day Pass', price: '750', description: 'Standard entry to all exhibition halls.', features: ['Access to All Exhibits', 'Digital Catalog', '1 Day Access'] },
            { name: 'All-Access Pass', price: '1950', description: 'Premium pass with private lounge access.', features: ['Priority Entry', 'Curator Guided Tour', 'VIP Lounge access', 'Opening Gala'] }
        ],
        speakers: [
            { name: 'Elena Rossi', role: 'Chief Curator', bio: 'Renowned for her work in minimalist exhibition design.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400' },
            { name: 'David Voss', role: 'Media Artist', bio: 'Pioneering new forms of digital interaction.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' }
        ],
        venue: {
            name: 'The White Cube Gallery',
            address: '45 Modernist Road, Visual District',
            directions: 'Located in the heart of the arts quarter.',
            parking: 'Complimentary valet parking for VIP guests.'
        },
        faq: [
            { question: 'Is photography allowed?', answer: 'Non-commercial photography without flash is permitted in all areas unless specified.' },
            { question: 'Are student discounts available?', answer: 'Yes, valid student IDs receive a 20% discount on standard Day Passes.' }
        ]
    }
};

async function seed() {
    try {
        await client.connect();
        const query = `
            INSERT INTO themes (name, description, category, "isPremium", price, status, "thumbnailUrl", "defaultProperties", "templateStructure", "defaultContent")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;
        `;
        const values = [
            themeData.name,
            themeData.description,
            themeData.category,
            themeData.isPremium,
            themeData.price,
            themeData.status,
            themeData.thumbnailUrl,
            JSON.stringify(themeData.defaultProperties),
            JSON.stringify(themeData.templateStructure),
            JSON.stringify(themeData.defaultContent)
        ];

        const res = await client.query(query, values);
        console.log('Visionary Expo Theme seeded successfully! ID:', res.rows[0].id);
    } catch (err) {
        console.error('Error seeding theme:', err);
    } finally {
        await client.end();
    }
}

seed();
