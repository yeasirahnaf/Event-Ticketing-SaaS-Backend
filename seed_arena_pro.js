const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'Saas',
});

const themeData = {
    name: 'Arena Pro',
    description: 'A high-energy, cinematic sports theme with bold red/orange accents, slanted UI elements, and aggressive typography.',
    category: 'Sports',
    isPremium: true,
    price: 89.99,
    status: 'active',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30?auto=format&fit=crop&q=80&w=800',
    defaultProperties: {
        colors: {
            primary: '#EF4444', // Red
            secondary: '#F97316', // Orange
            background: '#020617', // Navy Black
            text: '#FFFFFF', // White
            accent: '#1E293B' // Slate 800
        },
        fonts: {
            heading: 'Montserrat, sans-serif',
            body: 'Inter, sans-serif'
        },
        layout: 'dynamic'
    },
    templateStructure: {
        sections: {
            hero: { enabled: true, order: 1, style: 'cinematic' },
            about: { enabled: true, order: 2, style: 'split' },
            features: { enabled: true, order: 3, style: 'dynamic' },
            schedule: { enabled: true, order: 4, style: 'list' },
            speakers: { enabled: true, order: 5, style: 'cards' },
            tickets: { enabled: true, order: 6, style: 'premium' },
            venue: { enabled: true, order: 7, style: 'map' },
            gallery: { enabled: true, order: 8, style: 'masonry' },
            faq: { enabled: true, order: 9, style: 'accordion' }
        }
    },
    defaultContent: {
        hero: {
            title: 'THE CHAMPIONSHIP // ARENA PRO',
            subtitle: 'Witness the ultimate showdown of athletics and skill. Higher, Faster, Stronger.',
            backgroundImage: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=2000',
            ctaText: 'Reserve Your Seat',
            secondaryCtaText: 'View Match Schedule'
        },
        about: {
            heading: 'Ignite the Spirit',
            content: 'Arena Pro brings you closer to the action than ever before. From courtside intensity to the roar of the stadium, experience every heartbeat of the game.',
            images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1000']
        },
        features: [
            { icon: 'Zap', title: 'High-Speed Action', description: 'Experience the fastest games on the planet with 360-degree viewing angles.' },
            { icon: 'Shield', title: 'Fan Safety First', description: 'Advanced crowd management systems to ensure a secure environment for all fans.' },
            { icon: 'Activity', title: 'Live Stats Integration', description: 'Real-time performance analytics projected on the big screens throughout the venue.' }
        ],
        speakers: [
            { name: 'Coach Marcus', role: 'Head of Athletics', bio: '3-time Olympic gold medalist sharing the secrets of peak performance.', photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=400' },
            { name: 'Sarah J. Pro', role: 'Sports Analyst', bio: 'Expert commentator on strategic play and modern athletic trends.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' }
        ],
        schedule: [
            { time: '14:00', title: 'Warm-up Sessions', description: 'Athletes take the field for individual and group drills.' },
            { time: '18:00', title: 'Main Event: Opening Ceremony', description: 'Parade of champions and thematic performances.' },
            { time: '20:00', title: 'Championship Final', description: 'The much-anticipated showdown for the trophy.' }
        ],
        tickets: [
            { name: 'Standard Seat', price: '1500', description: 'Excellent view from the lower tier.', features: ['Standard Access', 'Digital Ticket', 'Arena Support'] },
            { name: 'Courtside VIP', price: '5000', description: 'The absolute best seats in the house.', features: ['VIP Lounge', 'Free Refreshments', 'Signed Program', 'Meet & Greet'] }
        ],
        venue: {
            name: 'Grand Central Arena',
            address: 'Sports Complex St, Gate 4',
            directions: 'Shuttle buses run every 10 mins from the Central Metro.',
            parking: 'Pre-bookable secure garage parking available.'
        },
        gallery: [
            'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1000'
        ],
        faq: [
            { question: 'What is the bag policy?', answer: 'Only clear bags up to 12"x6"x12" are allowed into the venue.' },
            { question: 'Are there group discounts?', answer: 'Yes, contact support for groups of 10 or more for a 15% discount.' }
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
        console.log('Sports Theme (Arena Pro) seeded successfully! ID:', res.rows[0].id);
    } catch (err) {
        console.error('Error seeding theme:', err);
    } finally {
        await client.end();
    }
}

seed();
