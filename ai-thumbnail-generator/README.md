# AI Thumbnail Generator

A server-rendered Node.js web app that lets users register, log in, generate YouTube thumbnail concepts with OpenAI DALL-E 3, and save their generated thumbnails to a MongoDB-backed library.

## Tech Stack

- Node.js 18+
- Express.js
- EJS server-side templates
- Vanilla JavaScript, HTML, and CSS
- Materialize CSS via CDN
- MongoDB with Mongoose
- Passport.js local authentication
- bcrypt password hashing
- express-session
- OpenAI DALL-E 3 API
- dotenv configuration

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in this directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-thumbnail-generator
   SESSION_SECRET=your_random_secret_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

3. Start MongoDB locally or update `MONGODB_URI` to point to your MongoDB instance.

4. Start the application:

   ```bash
   npm start
   ```

5. Visit:

   ```text
   http://localhost:3000
   ```

## User Flow

1. Register with name, email, and password.
2. Log in with Passport local authentication.
3. Enter a thumbnail prompt and select a style.
4. Generate a DALL-E 3 image from the server.
5. Save and view generated thumbnails in the library.
6. Delete thumbnails from the library after ownership is verified.
7. Log out to end the session.

## Project Structure

```text
ai-thumbnail-generator/
├── config/passport.js
├── middleware/isAuthenticated.js
├── models/User.js
├── models/Thumbnail.js
├── public/css/style.css
├── public/js/main.js
├── routes/auth.js
├── routes/thumbnails.js
├── views/
│   ├── partials/header.ejs
│   ├── partials/footer.ejs
│   ├── index.ejs
│   ├── register.ejs
│   ├── login.ejs
│   ├── generate.ejs
│   └── library.ejs
├── .env
├── .gitignore
├── app.js
├── package.json
└── package-lock.json
```

## Notes

- OpenAI API calls are made only from the server in `routes/thumbnails.js`.
- Passwords are never stored directly; `routes/auth.js` hashes passwords with bcrypt using 10 salt rounds.
- The delete route matches both thumbnail `_id` and `userId` so users cannot delete another user's thumbnails.
- `.env` is ignored by git and should not be committed.
