// // --- CORS Configuration ---
// const allowedOrigins = [
//   'http://localhost:5173', // Vite default
//   'http://127.0.0.1:5173',
// ];

// const corsOptions = {
//   origin: (origin: string | undefined, callback: (error: Error | null, result: boolean) => void => {
//     // Allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, // Required if you decide to use cookies/sessions later
// }