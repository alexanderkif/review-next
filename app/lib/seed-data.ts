import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function seedDatabase() {
  try {

    // 1. Create main CV record
    const cvData = await sql`
      INSERT INTO cv_data (
        name, title, email, phone, location, website, avatar_url,
        github_url, linkedin_url, about,
        skills_frontend, skills_tools, skills_backend,
        is_active, created_at, updated_at
      )
      VALUES (
        'Aleksandr Nikiforov',
        'Software Developer',
        'aleksandr.nikiforov.work@gmail.com',
        '',
        'Remote',
        'https://aleksandr-nikiforov-cv.vercel.app',
        '[]'::jsonb,
        'https://github.com/alexanderkif',
        'https://www.linkedin.com/in/aleksandr-nikiforov-8a417712a/',
        '• Profound understanding of JavaScript/TypeScript, SPA/PWA, HTML/CSS/SCSS, React, Vue.js, Angular, Karma/Jasmine, Node.js, microservices, RESTful services (JSON), AWS, Git.
• Experience with Agile, Jira, Azure, CI/CD pipelines, WCAG, Accessibility.
• Professional experience in computer technologies, networks, telecommunications, programming.
• Strong skills in electronics. My hobby is Arduino.
• Bachelor''s degree in informatics and computer engineering.
• Diploma in the specialty of multi-channel telecommunication systems technician.
• Open to relocate.',
        ARRAY['JavaScript', 'TypeScript', 'SPA', 'PWA', 'HTML', 'CSS', 'SCSS', 'React', 'Vue.js', 'Angular', 'Redux', 'Pinia', 'Node.js', 'microservices', 'RESTful services', 'JSON', 'AWS'],
        ARRAY['Karma/Jasmine', 'Git', 'Jira', 'Azure', 'CI/CD pipelines', 'Arduino (as a hobby)'],
        ARRAY['Experience with Agile', 'WCAG, Accessibility'],
        true,
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    const cvId = cvData[0].id;
    console.log('Created CV record with ID:', cvId);

    // 2. Add work experience
    await sql`
      INSERT INTO cv_experience (cv_id, title, company, period, description, is_current, sort_order)
      VALUES 
        (${cvId}, 'Software Developer', 'EPAM Systems • Novi Sad, Serbia', 'Jun 2021 - Present', 'In my current role, I focus on UI/UX development using Angular 19. I am contributing to a Storybook based on the Kendo UI library and integrating custom components into a data-collection portal for a large multinational corporation in the energy sector. In my previous project, I resolved accessibility issues flagged by an audit and implemented two custom widgets using Recharts'' BarChart for a new ReactJS-based dashboard. I also developed a reusable custom BarChart as a Storybook component. Prior to that, I worked on a large-scale enterprise application for a global leader in the Scheduling & HR domain. My responsibilities involved close collaboration with three teams, including daily communication with the core team in Canada. The project was a highly complex solution with a large codebase and intricate deployment infrastructure. In another project, I contributed to an application used by an oil company, where I implemented significant functional extensions, ensuring high code quality standards and enhancing the user experience.', true, 1),
        (${cvId}, 'Front-end Developer', 'S.K.A.T. • Krasnodar, Russian Federation', 'Oct 2019 - Jun 2021', 'Working on a project for a municipal public service center. Activities included creating a functionality for managing tickets for people to see specialists. That also includes collecting statistics and creating sophisticated visual reports. An existing old platform was converted into a modern web-based application. Again, collaboration and maintaining high quality coding standards was the key to our success.', false, 2),
        (${cvId}, 'Network Infrastructure Engineer', 'CJSC Greenatom • Glazov, Russian Federation', 'Feb 2018 - Jun 2021', 'Installation, configuration, and maintenance of Cisco switches in the internal, technological and Internet networks of a large enterprise, numbering about 200 switches. Troubleshoot network issues and outages. Work with other engineers to design and implement network changes. Support and troubleshooting of computers, printers, and other network equipment for local network users.', false, 3)
    `;

    // 3. Add education
    await sql`
      INSERT INTO cv_education (cv_id, degree, institution, period, description, sort_order)
      VALUES 
        (${cvId}, 'Informatics and Computer Engineering', 'Izhevsk State Technical University (ISTU) • Izhevsk, Russian Federation', 'Sep 2017 - Feb 2022', 'WES: https://www.credly.com/badges/2a767133-aed4-42c9-8c55-ac1950e58eb2/public_url', 1),
        (${cvId}, 'Multi-channel Telecommunication Systems Technician', 'Technical University of Communications and Informatics (MTUCI) • Moscow, Russian Federation', 'Sep 1997 - May 2000', '', 2)
    `;

    // 4. Add languages
    await sql`
      INSERT INTO cv_languages (cv_id, language, level, sort_order)
      VALUES 
        (${cvId}, 'English', 'Intermediate', 1),
        (${cvId}, 'Russian', 'Native', 2)
    `;

    // 5. Add real projects
    const projectsData = [
      {
        title: 'Angular Zoneless Template',
        description: '🚀 Angular 20 Zoneless Starter Starter template for Angular 20 Zoneless apps with SSR and NgRx state management. Includes 100% unit test coverage (Karma + Jasmine), e2e tests (Playwright), and is optimized for Vercel deployment.',
        shortDescription: 'Angular 20 Zoneless Starter with SSR and NgRx',
        technologies: ['Angular', 'TypeScript', 'SSR', 'NGRX', 'Karma', 'Jasmine', 'Playwright', 'Angular', 'Vercel'],
        githubUrl: 'https://github.com/alexanderkif/angular-zoneless-template',
        demoUrl: 'https://angular-zoneless-template.vercel.app/',
        year: 2025,
        featured: true,
        status: 'completed'
      },
      {
        title: 'Piano PWA',
        description: 'Couldn\'t resist vibe coding again 🙂 My daughter\'s class asked the kids to bring a musical instrument — even a toy piano would do. We have a full 88-key synth at home (way too heavy to carry 😅), so I built a little PWA toy piano for the phone that works offline. Then I added sampled piano sounds… and later asked AI to add a key-width switch. Fixing small things here and there is easy, but the fun part is realizing how much you can do when AI becomes your tireless coding partner 🤖🚀',
        shortDescription: 'JavaScript PWA toy piano with offline support',
        technologies: ['JavaScript', 'PWA', 'Web Audio API', 'Service Worker'],
        githubUrl: 'https://github.com/alexanderkif/piano/',
        demoUrl: 'https://piano-pwa.vercel.app/',
        year: 2025,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Sliding Picture Puzzle Game',
        description: 'Vibe coding is seriously addictive 😅 I\'ve been experimenting again — this time trying to build the classic "Fifteen" game with AI, giving it only verbal instructions. AI is amazing with simple stuff, but once the requests pile up, it sometimes freezes or starts looping like a stuck record 🎶. The trick I found: jump in, fix the code a bit yourself, and then tell the AI "forget everything we talked about before — now just listen to this new request". Works like magic ✨. I honestly think the future of programming belongs to those who don\'t just use AI, but know how to tame it. 🚀',
        shortDescription: 'Classic "Fifteen" sliding puzzle game PWA',
        technologies: ['JavaScript', 'PWA'],
        githubUrl: 'https://github.com/alexanderkif/picture-puzzle/',
        demoUrl: 'https://picture-puzzle-pwa.vercel.app/',
        year: 2025,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Cards for Training Memory',
        description: '🚀 Boost Your Memory and Learning with Cards! 📚✨ Create Personalized Flashcards: Easily make groups of cards with terms, concepts, or any information you want to remember. Each card shows your chosen content on one side and its translation, definition, or examples on the other. Share Your Flashcards: Easily share your groups of flashcards with others, making collaborative learning a breeze.🚀 Start your journey towards better memory and enhanced learning with Cards today! ✨ I\'ve set up a Telegram group where everyone can share their flashcards! 📚 You can join the group directly from the top menu of the Cards app. 🤖 Plus, I\'ve created a Telegram bot to help keep things organized and ensure everyone follows the group rules. 📋 I\'ve also added some example messages with card files attached to help you get started. Can\'t wait to see you there! 🚀',
        shortDescription: 'Flashcards PWA for memory training and learning',
        technologies: ['TypeScript', 'React', 'PWA', 'Redux'],
        githubUrl: null,
        demoUrl: 'https://cards-pwa.vercel.app/',
        year: 2024,
        featured: true,
        status: 'completed'
      },
      {
        title: 'Wallets PWA',
        description: 'This is a simple yet practical application for tracking your expenses and income. It\'s built as a Progressive Web App (PWA), which means you can install it on your device and use it just like a native app. 📱 Installable on desktop or mobile 🔒 All data stays on your device (stored in browser local storage) 🌐 Works completely offline — no internet required Perfect for quick personal finance tracking without the complexity of big apps.',
        shortDescription: 'Expense tracking PWA with offline support',
        technologies: ['TypeScript', 'Quasar Framework', 'PWA', 'Pinia'],
        githubUrl: 'https://github.com/alexanderkif/walletPWA',
        demoUrl: 'https://alexanderkif.github.io/walletPWA',

        year: 2022,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Spin Me Game',
        description: 'SpinMe Game is a casual puzzle game where the goal is to place all pieces on the board by spinning them around their axis. If a square is already occupied, the game highlights it to help you plan your moves. 🕹 How to play Select a piece – swipe UP or press the UP key, or simply click on a piece. Rotate the piece – swipe LEFT/RIGHT, use the arrow keys, or tap the on-screen rotate buttons. Place the piece – swipe DOWN, press the DOWN key, or tap the on-screen button. The game supports both keyboard controls and touch gestures, making it equally fun to play on desktop or mobile.',
        shortDescription: 'Casual puzzle game with touch and keyboard controls',
        technologies: ['TypeScript', 'Vue.js', 'Pinia'],
        githubUrl: null,
        demoUrl: 'https://www.spinmegame.com',

        year: 2022,
        featured: true,
        status: 'completed'
      },
      {
        title: 'Netflix Roulette',
        description: 'This project is a React training course challenge. It demonstrates state management with Redux, routing with React Router, asynchronous actions with Thunk, and testing with Enzyme and React Testing Library. ⚠️ Note: The app works fully with the local API. The Vercel deployment uses a remote API that is no longer functional.',
        shortDescription: 'Movie discovery app with Redux and React Router',
        technologies: ['TypeScript', 'React', 'Redux', 'React Router', 'Thunk', 'Enzyme', 'Testing Library'],
        githubUrl: 'https://github.com/alexanderkif/react-movies',
        demoUrl: 'https://react-movies-kappa.vercel.app/',

        year: 2021,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Sibdev2',
        description: 'Test task for Sibdev. Part 2. Working with the YouTube API. Description and link to Figma in Readme file on GitHub. Demo access: user1 password1',
        shortDescription: 'YouTube API integration test task',
        technologies: ['Vue.js', 'YouTube API'],
        githubUrl: 'https://github.com/alexanderkif/sibdev2',
        demoUrl: 'https://alexanderkif.github.io/sibdev2/',

        year: 2020,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Logistic Task Optimizer',
        description: 'This application is a logistics task simulator designed to plan and optimize delivery routes for a fleet of vehicles serving multiple stores in a district. Users can upload a sample Excel order file, and the program automatically calculates: Optimal delivery routes and schedules for a 5-day workweek, Estimated transportation costs, including vehicle operation, hired transport, overtime, and penalties, Detailed analysis of delivery efficiency, considering load capacity, travel time, and operational constraints. The system accounts for: Different product types with restrictions on combined transport, Vehicle limitations (own fleet and hired vehicles), Loading, unloading, and break times, Overtime and underutilization penalties. The output includes tables, charts, and delivery plans, helping visualize schedules, costs, and route efficiency.',
        shortDescription: 'Logistics route optimization and cost analysis tool',
        technologies: ['Quasar Framework', 'Excel Processing', 'Data Visualization'],
        githubUrl: 'https://github.com/alexanderkif/logist',
        demoUrl: 'https://alexanderkif.github.io/logist',

        year: 2021,
        featured: false,
        status: 'completed'
      },
      {
        title: 'TakeoffStaff Test Task',
        description: 'Test task for TakeoffStaff. Description in Readme file on GitHub. I\'ve tried Babylon JS here later.',
        shortDescription: 'Vue.js test task with Babylon.js experimentation',
        technologies: ['Vue.js', 'Babylon.js', '3D Graphics'],
        githubUrl: 'https://github.com/alexanderkif/takeoffstaff',
        demoUrl: 'https://alexanderkif.github.io/takeoffstaff',

        year: 2020,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Buy For Me - Shopping Lists',
        description: 'Demo access: User: Saha2, Password: s222 This application allows multiple users to collaboratively manage shopping lists in real time. Each list can be filled out and updated by several users simultaneously. All data is securely stored in a MongoDB database, and the Vercel serverless API handles access and updates. Features include: Create, edit, and share shopping lists with a group of users, Real-time updates across all users in the same group, Persistent storage in MongoDB for reliable access from any device, Demo access available without registration. To try the app, you can register/login and use group IDs: 5f152ec3ea3c4800083d7de6 or 5f13f49eca7ee00007801c84. Alternatively, use the demo credentials: User: Saha2, Password: s222',
        shortDescription: 'Collaborative shopping lists with real-time updates',
        technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Vercel'],
        githubUrl: 'https://github.com/alexanderkif/todogroup',
        demoUrl: 'https://buyforme.vercel.app',

        year: 2020,
        featured: false,
        status: 'completed'
      },
      {
        title: 'DoMeteo - Autonomous Weather Station',
        description: 'This is an autonomous weather station that can also store data from any sensors. In my setup, I used a weather sensor (BME280). The board starts, sends data, and then goes to sleep for 5 minutes to save power. To optimize battery usage: A field-effect transistor connected to pin D6 cuts off power to the BME280 when the board sleeps. The 18650 lithium battery is monitored via input A0. If the battery voltage exceeds 4.2V, the D7 output disables the solar panel charging circuit to prevent overcharging.',
        shortDescription: 'Solar-powered weather station with power optimization',
        technologies: ['Arduino', 'Node.js', 'MongoDB', 'Vue.js', 'IoT'],
        githubUrl: 'https://github.com/alexanderkif/dometeo',
        demoUrl: 'https://alexanderkif.github.io/dometeo',

        year: 2020,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Meteo - Autonomous Outdoor Weather Station',
        description: 'The weather station is powered by a lithium battery, charged by a solar panel. Data is transmitted via Wi-Fi to a back-end hosted on Zeit.co and stored in MongoDB. A universal GET request is available: /data?start=START_DATE&finish=FINISH_DATE&tframe=TFRAME&step=STEP TFRAME can be month, day, hour, or minute. A small frontend is built with Quasar. To view it, click [TO DEPLOY]. The last reading was on March 14, 2022, at 9:58 AM — at that time, I was forced to leave my home forever. To explore historical data and graphs, select the period from July 1, 2019, to March 14, 2022.',
        shortDescription: 'Solar-powered WiFi weather station with historical data',
        technologies: ['Node.js', 'MongoDB', 'JavaScript', 'Vue.js', 'IoT'],
        githubUrl: 'https://github.com/alexanderkif/meteo',
        demoUrl: 'https://alexanderkif.github.io/meteo-front',

        year: 2019,
        featured: false,
        status: 'completed'
      },
      {
        title: 'Solar Tracker Robot',
        description: 'Mentored my son to build a robot that tracks the sun, automatically rotating solar panels to collect maximum energy. Participated in the Junior Russian Schoolchildren\'s Competition at MEPhI, where my son won first place, and I received a Project Supervisor Certificate. Skills demonstrated: PWA development, robotics, automation, and mentoring in STEM projects.',
        shortDescription: 'Award-winning solar tracking robot for competition',
        technologies: ['Vue.js', 'Robotics', 'Solar Tracking'],
        githubUrl: 'https://github.com/alexanderkif/solarTracker',
        demoUrl: 'https://alexanderkif.github.io/solarTracker/',

        year: 2016,
        featured: true,
        status: 'completed'
      }
    ];
    
    // Create all projects
    const projectIds = [];
    
    // Create projects from projectsData array
    for (let i = 0; i < projectsData.length; i++) {
      const projectData = projectsData[i];
      
      // Create project without images
      const projectResult = await sql`
        INSERT INTO projects (
          title, description, short_description, technologies,
          github_url, demo_url, image_urls, year, featured, status, created_at
        )
        VALUES (
          ${projectData.title},
          ${projectData.description},
          ${projectData.shortDescription},
          ${projectData.technologies},
          ${projectData.githubUrl},
          ${projectData.demoUrl},
          ARRAY[]::text[],
          ${projectData.year},
          ${projectData.featured},
          ${projectData.status},
          NOW()
        )
        RETURNING id
      `;
      
      projectIds.push(projectResult[0].id);
    }

    console.log('Seeded projects with real data');
    console.log('Database seeding completed successfully!');

    return {
      success: true,
      cvId,
      projectIds
    };

  } catch (error) {
    console.error('Database seeding error:', error);
    throw error;
  }
}