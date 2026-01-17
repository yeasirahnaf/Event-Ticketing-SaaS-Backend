const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'Saas',
});

const themeData = {
    name: 'Festiva',
    description: 'A vibrant, organic, and artistic theme for festivals, carnivals, and cultural events. Features rounded shapes, playful typography, and a lively color palette.',
    category: 'Festival',
    isPremium: true,
    price: 99.99,
    status: 'active',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=800',
    defaultProperties: {
        colors: {
            primary: '#EC4899', // Pink
            secondary: '#EAB308', // Yellow
            background: '#ffffff', // White base
            text: '#1F2937', // Gray 800
            accent: '#D946EF' // Purple
        },
        fonts: {
            heading: 'Outfit, sans-serif',
            body: 'Nunito, sans-serif'
        },
        layout: 'organic'
    },
    templateStructure: {
        sections: {
            hero: { enabled: true, order: 1, style: 'organic' },
            about: { enabled: true, order: 2, style: 'overlap' },
            features: { enabled: true, order: 3, style: 'cards-rounded' },
            schedule: { enabled: true, order: 4, style: 'timeline-curved' },
            speakers: { enabled: true, order: 5, style: 'circles' },
            tickets: { enabled: true, order: 6, style: 'colorful' },
            venue: { enabled: true, order: 7, style: 'illustrated' },
            gallery: { enabled: true, order: 8, style: 'mosaic' },
            faq: { enabled: true, order: 9, style: 'bubbles' }
        }
    },
    defaultContent: {
        hero: {
            title: 'SUMMER VIBES FEST 2026',
            subtitle: 'Music, Art, and Magic under the stars. Join the celebration of life and creativity.',
            backgroundImage: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=2000',
            ctaText: 'Grab Your Passes',
            secondaryCtaText: 'View Lineup'
        },
        about: {
            heading: 'A World of Color',
            content: 'Festiva is more than just an event; it is a community. We bring together the best indie artists, street food vendors, and performers for a weekend you will never forget.',
            images: ['https://images.unsplash.com/photo-1506157786151-b8491531f436?auto=format&fit=crop&q=80&w=1000']
        },
        features: [
            { icon: 'Music', title: 'Live Performances', description: '3 Stages featuring over 50 artists from around the globe.' },
            { icon: 'Coffee', title: 'Food Carnival', description: 'Gourmet street food from 20+ local vendors and chefs.' },
            { icon: 'Palette', title: 'Art Installations', description: 'Interactive art pieces and light shows throughout the venue.' }
        ],
        speakers: [
            { name: 'DJ Solar', role: 'Headliner', bio: 'Bringing the sunset vibes with deep house and tropical beats.', photo: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=400' },
            { name: 'Luna Band', role: 'Live Act', bio: 'Indie rock sensations debuting their new album live.', photo: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&q=80&w=400' }
        ],
        schedule: [
            { time: '12:00', title: 'Gates Open', description: 'Welcome drinks and face painting start.' },
            { time: '16:00', title: 'Sunset Jam', description: 'Acoustic sessions at the chill-out zone.' },
            { time: '21:00', title: 'Firework Grand Finale', description: 'Lighting up the sky to close the night.' }
        ],
        tickets: [
            { name: 'Day Pass', price: '800', description: 'Access to all stages for one day.', features: ['General Entry', 'Free Drink', 'Digital Map'] },
            { name: 'Weekend Bundle', price: '2000', description: 'Full 3-day experience with camping.', features: ['3-Day Access', 'Camping Spot', 'Festiva Hat', 'Fast Track Entry'] }
        ],
        venue: {
            name: 'Riverside Park',
            address: 'Greenwich Bay Area',
            directions: 'Follow the colorful signs from the main highway exit.',
            parking: 'Grass parking lots available near the north entrance.'
        },
        gallery: [
            'https://images.unsplash.com/photo-1470229722913-7ea9959fa270?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=1000'
        ],
        faq: [
            { question: 'Is it pet friendly?', answer: 'Yes! Leashed pets are welcome in the outdoor areas.' },
            { question: 'Can I bring my own food?', answer: 'Small snacks are allowed, but check out our amazing food stalls!' }
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
        console.log('Festival Theme (Festiva) seeded successfully! ID:', res.rows[0].id);
    } catch (err) {
        console.error('Error seeding theme:', err);
    } finally {
        await client.end();
    }
}

seed();
