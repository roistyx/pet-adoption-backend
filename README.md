# PetAdoption-Backend

This Node.js project is the backend for a [pet adoption platform](https://github.com/roistyx/pet-adoption-frontend), featuring secure authentication, image uploads, and a RESTful API for managing users and pet catalogs. Utilizing Express.js, it provides a scalable and maintainable architecture with key functionalities like JWT-based user authentication, CORS for cross-origin requests, and multer for handling image uploads. The project structure emphasizes separation of concerns through distinct controllers and DAOs, supporting dynamic search capabilities and a comprehensive set of endpoints for user and pet management.

- Key Features:

* Secure User Authentication: Uses JWT for authentication and includes middleware for authorization.
* Image Uploads: Integrates multer for image file handling, essential for pet profiles.
* Scalable Architecture: Leverages Express.js and organizes logic into controllers and \* DAOs for maintainability.
* Dynamic Search: Offers search functionalities within the pet catalog.
* RESTful API Endpoints: Provides a full suite of endpoints for CRUD operations on users and pets.

### Architecture

- Controllers: Separation of concerns is achieved through UsersController and CatalogController, handling business logic related to users and pets respectively.
- Data Access Objects (DAOs): UsersDAO and CatalogDAO abstract the database interactions, promoting clean, maintainable code.
- Middleware: AuthMiddleware ensures that certain routes are accessible only by authenticated and authorized users.
- Database Initialization: A custom InitDB function is used for setting up and connecting to the MongoDB database.

### Installing

- Ensure MongoDB is installed and running.
- Install dependencies with npm install.
- Start the server with npm start. The server runs on port 3100 by default.

### Environment Configuration

The project uses dotenv for managing environment variables. Configure the following in your .env file:

- JWT_SECRET: Secret key for JWT.
- MongoDB connection settings.

## Authors

- [roistyx](https://github.com/roistyx)
