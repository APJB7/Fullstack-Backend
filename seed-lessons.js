require('dotenv').config();
const { connectToDatabase } = require('./db');

async function seedLessons() {
    const db = await connectToDatabase();
    const lessonsCollection = db.collection('lessons');

    await lessonsCollection.deleteMany({});

    const lessons = [
        { id: 1, subject: 'Math', topic: 'Math', location: 'UK', price: 2500, space: 5, rating: 4, description: 'Algebra & Geometry foundations with problem-solving drills.', icon: 'fa-solid fa-square-root-variable', image: '/images/math_logo1.png' },
        { id: 2, subject: 'Physics', topic: 'Physics', location: 'UK', price: 2200, space: 5, rating: 5, description: 'Mechanics, waves and electricity with lab-style demos.', icon: 'fa-solid fa-atom', image: '/images/science_logo1.png' },
        { id: 3, subject: 'Programming', topic: 'Programming', location: 'USA', price: 1800, space: 5, rating: 4, description: 'Modern JS essentials, DOM, and mini-app projects.', icon: 'fa-solid fa-code', image: '/images/it_logo1.png' },
        { id: 4, subject: 'English', topic: 'English', location: 'USA', price: 2000, space: 5, rating: 3, description: 'Writing, comprehension and speaking confidence.', icon: 'fa-solid fa-book-open', image: '/images/english_logo1.png' },
        { id: 5, subject: 'Math', topic: 'Math', location: 'UK', price: 1900, space: 5, rating: 4, description: 'Exam tactics: functions, stats, calculator strategies.', icon: 'fa-solid fa-square-root-variable', image: '/images/math_logo1.png' },
        { id: 6, subject: 'Programming', topic: 'Programming', location: 'UK', price: 2100, space: 5, rating: 5, description: 'APIs, fetch, and components—build a mini SPA.', icon: 'fa-solid fa-code', image: '/images/it_logo1.png' },
        { id: 7, subject: 'Physics', topic: 'Physics', location: 'USA', price: 2300, space: 5, rating: 4, description: 'Kinematics and circuits with past-paper practice.', icon: 'fa-solid fa-atom', image: '/images/science_logo1.png' },
        { id: 8, subject: 'English', topic: 'English', location: 'UK', price: 1700, space: 5, rating: 5, description: 'Vocabulary, grammar, and presentation skills.', icon: 'fa-solid fa-book-open', image: '/images/english_logo1.png' },
        { id: 9, subject: 'Math', topic: 'Math', location: 'USA', price: 2600, space: 5, rating: 5, description: 'Advanced prep: trigonometry & calculus sprints.', icon: 'fa-solid fa-square-root-variable', image: '/images/math_logo1.png' },
        { id: 10, subject: 'Programming', topic: 'Programming', location: 'USA', price: 2400, space: 5, rating: 4, description: 'Asynchronous JS and local storage app patterns.', icon: 'fa-solid fa-code', image: '/images/it_logo1.png' }
    ];

    await lessonsCollection.insertMany(lessons);
    console.log('Database seeded with lessons');
    process.exit(0);
}

seedLessons().catch(err => {
    console.error('Failed to seed database', err);
    process.exit(1);
});

