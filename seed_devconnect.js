const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'Saas',
});

const themeData = {
    name: 'DevConnect',
    description: 'A high-tech, developer-centric theme with a dark aesthetic, grid patterns, and monospace fonts.',
    category: 'Tech Conference',
    isPremium: true,
    price: 69.99,
    status: 'active',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    defaultProperties: {
        colors: {
            primary: '#22C55E', // Matrix Green
            secondary: '#10B981', // Emerald
            background: '#000000', // Pitch Black
            text: '#FFFFFF', // White
            accent: '#111827' // Gray 900
        },
        fonts: {
            heading: 'Space Mono, monospace',
            body: 'Inter, sans-serif'
        },
        layout: 'terminal'
    },
    templateStructure: {
        sections: {
            hero: { enabled: true, order: 1, style: 'tech' },
            about: { enabled: true, order: 2, style: 'grid' },
            features: { enabled: true, order: 3, style: 'blocks' },
            schedule: { enabled: true, order: 4, style: 'terminal' },
            speakers: { enabled: true, order: 5, style: 'cards' },
            tickets: { enabled: true, order: 6, style: 'bordered' },
            venue: { enabled: true, order: 7, style: 'minimal' },
            gallery: { enabled: true, order: 8, style: 'grid' },
            faq: { enabled: true, order: 9, style: 'simple' }
        }
    },
    defaultContent: {
        hero: {
            title: 'DEV_CONNECT // 2026',
            subtitle: 'Compiling the future of software, AI, and decentralized systems. Join 5000+ developers in the heart of the tech hub.',
            backgroundImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000',
            ctaText: 'git checkout tickets',
            secondaryCtaText: 'view_source'
        },
        about: {
            heading: 'System.initialize()',
            content: 'DevConnect is where the global developer community intersects with leading-edge innovation. We focuses strictly on deep technical sessions, collaborative coding, and architectural breakthroughs. No marketing fluff, just pure code.',
            images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1000']
        },
        features: [
            { icon: 'Code2', title: 'Deep Tech Tracks', description: 'Advanced sessions on kernel development, distributed systems, and LLM fine-tuning.' },
            { icon: 'Cpu', title: 'Hardware Labs', description: 'Hands-on experience with the latest edge computing and IoT hardware.' },
            { icon: 'Terminal', title: 'Capture The Flag', description: 'Competitive cybersecurity challenges for all skill levels with significant prizes.' }
        ],
        speakers: [
            { name: 'Linus Sterling', role: 'Kernel Architect', bio: 'Pioneering open-source contributions for over two decades.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
            { name: 'Ada Lovelace Jr.', role: 'AI Principal', bio: 'Specializing in neural architecture search and ethical AI frameworks.', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' }
        ],
        schedule: [
            { time: '09:00', title: 'Init Process', description: 'Registration and hardware setup.' },
            { time: '10:30', title: 'Root Command', description: 'Opening Keynote: Scaling to a Billion Users.' },
            { time: '14:00', title: 'Parallel Processing', description: 'Breakout sessions on Rust, Go, and Web3.' }
        ],
        tickets: [
            { name: 'Dev Pass', price: '2500', description: 'Main hall access and workshop materials.', features: ['Full Session Access', 'Digital Certificate', 'DevConnect T-Shirt'] },
            { name: 'Superuser Pass', price: '7500', description: 'VIP access with speaker meet & greet.', features: ['All Dev Benefits', 'Speaker Dinner', 'Limited Edition Hoodie', 'VIP Lounge'] }
        ],
        venue: {
            name: 'Cyberport Innovation Center',
            address: 'Tech District, Hall 7',
            directions: 'Take the Green Line to Innovation Station.',
            parking: 'EV charging available for all attendees.'
        },
        gallery: [
            'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000'
        ],
        faq: [
            { question: 'Is there high-speed Wi-Fi?', answer: 'Yes, we provide 10Gbps dedicated fiber for all attendees.' },
            { question: 'Can I pay with Crypto?', answer: 'Yes, we accept BTC, ETH, and USDC at checkout.' }
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
        console.log('Tech Conference Theme (DevConnect) seeded successfully! ID:', res.rows[0].id);
    } catch (err) {
        console.error('Error seeding theme:', err);
    } finally {
        await client.end();
    }
}

seed();
